package services

import (
	"log/slog"
	"math/rand"
	"time"

	"github.com/duke-git/lancet/v2/datetime"
	"github.com/duke-git/lancet/v2/slice"
	"github.com/leandro-lugaresi/hub"
	"github.com/muety/artifex/v2"
	"github.com/muety/wakapi/config"
	"github.com/muety/wakapi/internal/mail"
	"github.com/muety/wakapi/models"
	summarytypes "github.com/muety/wakapi/types"
	"github.com/muety/wakapi/utils"
	"gorm.io/gorm"
)

// delay between evey report generation task (to throttle email sending frequency)
const reportDelay = 10 * time.Second

// past time range to cover in the report
const reportRange = 7 * 24 * time.Hour

type ReportService struct {
	config         *config.Config
	eventBus       *hub.Hub
	summaryService ISummaryService
	userService    IUserService
	mailService    mail.IMailService
	rand           *rand.Rand
	queueDefault   *artifex.Dispatcher
	queueWorkers   *artifex.Dispatcher
	db             *gorm.DB
}

// ReportDeduplicator ensures a report is not sent multiple times for the same user in the same week
type ReportDeduplicator struct {
	db         *gorm.DB
	user       *models.User
	reportDate time.Time
}

func ReportSentTracker(db *gorm.DB, user *models.User) *ReportDeduplicator {
	// Calculate the start of the current week (Monday) in the user's timezone
	now := time.Now().In(user.TZ())
	weekday := int(now.Weekday())
	if weekday == 0 { // Sunday = 0, make it 7 for easier calculation
		weekday = 7
	}
	daysFromMonday := weekday - 1 // Monday = 0 days from Monday
	startOfWeek := now.AddDate(0, 0, -daysFromMonday).Truncate(24 * time.Hour)
	
	return &ReportDeduplicator{
		db:         db,
		user:       user,
		reportDate: startOfWeek,
	}
}

func (rst *ReportDeduplicator) IsReportSent() bool {
	var existingReportSent models.UserReportSent
	err := rst.db.Where("user_id = ? AND report_date = ?", rst.user.ID, rst.reportDate).First(&existingReportSent).Error
	return err == nil
}

func (rst *ReportDeduplicator) MarkReportAsSent() error {
	reportSent := &models.UserReportSent{
		UserID:     rst.user.ID,
		ReportDate: rst.reportDate,
		SentAt:     time.Now(),
	}
	if err := rst.db.Create(reportSent).Error; err != nil {
		slog.Warn("failed to save report sent record (possible race condition or duplicate)",
			"userID", reportSent.UserID,
			"reportDate", reportSent.ReportDate,
			"error", err)
		return nil
	}
	slog.Debug("saved report sent record", "userID", reportSent.UserID, "reportDate", reportSent.ReportDate)
	return nil
}

func NewReportService(db *gorm.DB) *ReportService {
	summaryService := NewSummaryService(db)
	userService := NewUserService(db)

	srv := &ReportService{
		config:         config.Get(),
		eventBus:       config.EventBus(),
		summaryService: summaryService,
		userService:    userService,
		mailService:    mail.NewMailService(),
		rand:           rand.New(rand.NewSource(time.Now().Unix())),
		queueDefault:   config.GetDefaultQueue(),
		queueWorkers:   config.GetQueue(config.QueueReports),
		db:             db,
	}

	return srv
}

// Legacy method - now handled by River periodic jobs in api.go
// Kept for backward compatibility but no longer schedules cron jobs
func (srv *ReportService) Schedule() {
	slog.Info("report scheduling is now handled by River periodic jobs")
}

func (srv *ReportService) SendReport(user *models.User, duration time.Duration) error {
	if user.Email == "" {
		slog.Warn("not generating report as no e-mail address is set", "userID", user.ID)
		return nil
	}

	tracker := ReportSentTracker(srv.db, user)
	if tracker.IsReportSent() {
		slog.Debug("report already sent for this week, skipping", "userID", user.ID)
		return nil
	}

	slog.Info("generating report for user", "userID", user.ID)
	end := datetime.EndOfDay(time.Now().Add(-24 * time.Hour).In(user.TZ()))
	start := end.Add(-1 * duration).Add(1 * time.Second)

	request := summarytypes.NewSummaryRequest(start, end, user)
	options := summarytypes.DefaultProcessingOptions()
	fullSummary, err := srv.summaryService.Generate(request, options)
	if err != nil {
		config.Log().Error("failed to generate report", "userID", user.ID, "error", err)
		return err
	}

	// generate per-day summaries
	dayIntervals := utils.SplitRangeByDays(start, end)
	dailySummaries := make([]*models.Summary, len(dayIntervals))

	for i, interval := range dayIntervals {
		from, to := datetime.BeginOfDay(interval.Start), interval.End
		request := summarytypes.NewSummaryRequest(from, to, user)
		options := summarytypes.DefaultProcessingOptions()
		summary, err := srv.summaryService.Generate(request, options)
		if err != nil {
			config.Log().Error("failed to generate day summary for report", "from", from, "to", to, "userID", user.ID, "error", err)
			break
		}
		summary.FromTime = models.CustomTime(from)
		summary.ToTime = models.CustomTime(to.Add(-1 * time.Second))
		dailySummaries[i] = summary
	}

	report := &models.Report{
		From:           start,
		To:             end,
		User:           user,
		Summary:        fullSummary,
		DailySummaries: dailySummaries,
	}

	if err := srv.mailService.SendReport(user, report); err != nil {
		config.Log().Error("failed to send report", "userID", user.ID, "error", err)
		return err
	}

	slog.Info("sent report to user", "userID", user.ID)
	err = tracker.MarkReportAsSent()
	if err != nil {
		slog.Debug("error marking report as sent", "userID", user.ID, err.Error(), err)
	}
	return nil
}

func (srv *ReportService) SendWeeklyReports() error {
	users, err := srv.userService.GetAllByReports(true)
	if err != nil {
		config.Log().Error("failed to get users for report generation", "error", err)
		return err
	}

	// filter users who have their email set
	users = slice.Filter(users, func(i int, u *models.User) bool {
		return u.Email != ""
	})

	slog.Info("sending weekly reports", "userCount", len(users))

	var errors []error
	for _, user := range users {
		if err := srv.SendReport(user, reportRange); err != nil {
			config.Log().Error("failed to send report for user", "userID", user.ID, "error", err)
			errors = append(errors, err)
		}
		
		// Brief delay between sends to avoid overwhelming email service
		time.Sleep(1 * time.Second)
	}
	
	if len(errors) > 0 {
		slog.Warn("some reports failed to send", "failedCount", len(errors), "totalCount", len(users))
	}
	
	return nil
}
