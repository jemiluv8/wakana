package services

import (
	"fmt"
	"log/slog"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/leandro-lugaresi/hub"
	"github.com/muety/artifex/v2"
	"github.com/muety/wakapi/config"
	"github.com/muety/wakapi/helpers"
	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/repositories"
	summarytypes "github.com/muety/wakapi/types"
	"github.com/muety/wakapi/utils"
	"github.com/patrickmn/go-cache"
	"gorm.io/gorm"
)

type LeaderboardService struct {
	config         *config.Config
	cache          *cache.Cache
	eventBus       *hub.Hub
	repository     repositories.ILeaderboardRepository
	summaryService ISummaryService
	userService    IUserService
	queueDefault   *artifex.Dispatcher
	queueWorkers   *artifex.Dispatcher
	defaultScope   *models.IntervalKey
}

func NewLeaderboardService(db *gorm.DB) *LeaderboardService {
	leaderboardRepo := repositories.NewLeaderboardRepository(db)
	summaryService := NewSummaryService(db)
	userService := NewUserService(db)
	srv := &LeaderboardService{
		config:         config.Get(),
		cache:          cache.New(6*time.Hour, 6*time.Hour),
		eventBus:       config.EventBus(),
		repository:     leaderboardRepo,
		summaryService: summaryService,
		userService:    userService,
		queueDefault:   config.GetDefaultQueue(),
		queueWorkers:   config.GetQueue(config.QueueProcessing),
	}

	scope, err := helpers.ParseInterval(srv.config.App.LeaderboardScope)
	if err != nil {
		config.Log().Fatal(err.Error())
	}
	srv.defaultScope = scope

	onUserUpdate := srv.eventBus.Subscribe(0, config.EventUserUpdate)
	go func(sub *hub.Subscription) {
		for m := range sub.Receiver {

			// generate leaderboard for updated user, if leaderboard enabled and none present, yet
			user := m.Fields[config.FieldPayload].(*models.User)

			exists, err := srv.ExistsAnyByUser(user.ID)
			if err != nil {
				config.Log().Error("failed to check existing leaderboards upon user update", "error", err)
			}

			if user.PublicLeaderboard && !exists {
				slog.Info("generating leaderboard after settings update", "userID", user.ID)
				srv.ComputeLeaderboard([]*models.User{user}, srv.defaultScope, []uint8{models.SummaryLanguage})
			} else if !user.PublicLeaderboard && exists {
				slog.Info("clearing leaderboard after settings update", "userID", user.ID)
				if err := srv.repository.DeleteByUser(user.ID); err != nil {
					config.Log().Error("failed to clear leaderboard for user", "userID", user.ID, "error", err)
				}
				srv.cache.Flush()
			}
		}
	}(&onUserUpdate)

	return srv
}

func (srv *LeaderboardService) GetDefaultScope() *models.IntervalKey {
	return srv.defaultScope
}


func (srv *LeaderboardService) GenerateLeaderboards() error {
	return srv.GenerateLeaderboardsForInterval(srv.defaultScope)
}

func (srv *LeaderboardService) GenerateLeaderboardsForInterval(interval *models.IntervalKey) error {
	users, err := srv.userService.GetAll()
	if err != nil {
		config.Log().Error("failed to get users for leaderboard generation", "error", err)
		return err
	}
	
	slog.Info("generating leaderboards for all users regardless of settings", "userCount", len(users), "interval", (*interval)[0])
	return srv.ComputeLeaderboard(users, interval, []uint8{models.SummaryLanguage})
}

// GenerateWeeklyLeaderboards generates leaderboards for a 7-day period ending on the most recent Sunday at 23:59:59
// This method matches the logic used by the CLI command and background workers
func (srv *LeaderboardService) GenerateWeeklyLeaderboards() error {
	users, err := srv.userService.GetAll()
	if err != nil {
		config.Log().Error("failed to get users for leaderboard generation", "error", err)
		return err
	}
	
	// Calculate the same interval as the CLI command: 7 days until the most recent Sunday 23:59
	now := time.Now()
	
	// Find the most recent Sunday
	daysFromSunday := int(now.Weekday()) // Sunday = 0, Monday = 1, etc.
	if daysFromSunday == 0 {
		// If today is Sunday, use last Sunday
		daysFromSunday = 7
	}
	
	// Get the most recent Sunday at 23:59:59
	endTime := now.AddDate(0, 0, -daysFromSunday).
		Truncate(24 * time.Hour).
		Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	
	// Start time is 7 days before the end time at 00:00:00
	startTime := endTime.AddDate(0, 0, -6).
		Truncate(24 * time.Hour)

	slog.Info("generating weekly leaderboards for all users regardless of settings", 
		"userCount", len(users),
		"startTime", startTime.Format("2006-01-02 15:04:05"),
		"endTime", endTime.Format("2006-01-02 15:04:05"))
	
	// Use the Past 7 Days interval
	intervalKey := models.IntervalPast7Days
	
	return srv.ComputeLeaderboard(users, intervalKey, []uint8{models.SummaryLanguage})
}

func (srv *LeaderboardService) ComputeLeaderboard(users []*models.User, interval *models.IntervalKey, by []uint8) error {
	slog.Info("generating leaderboard", "interval", (*interval)[0], "userCount", len(users), "aggregationCount", len(by))

	for _, user := range users {
		if err := srv.repository.DeleteByUserAndInterval(user.ID, interval); err != nil {
			config.Log().Error("failed to delete leaderboard items for user", "userID", user.ID, "interval", (*interval)[0], "error", err)
			continue
		}

		item, err := srv.GenerateByUser(user, interval)
		if err != nil {
			config.Log().Error("failed to generate general leaderboard for user", "userID", user.ID, "error", err)
			continue
		}

		if err := srv.repository.InsertBatch([]*models.LeaderboardItem{item}); err != nil {
			config.Log().Error("failed to persist general leaderboard for user", "userID", user.ID, "error", err)
			continue
		}

		for _, by := range by {
			items, err := srv.GenerateAggregatedByUser(user, interval, by)
			if err != nil {
				config.Log().Error("failed to generate aggregated leaderboard for user", "aggregatedBy", models.GetEntityColumn(by), "userID", user.ID, "error", err)
				continue
			}

			if len(items) == 0 {
				continue
			}

			if err := srv.repository.InsertBatch(items); err != nil {
				config.Log().Error("failed to persist aggregated leaderboard for user", "aggregatedBy", models.GetEntityColumn(by), "userID", user.ID, "error", err)
				continue
			}
		}
	}

	srv.cache.Flush()
	slog.Info("finished leaderboard generation")
	return nil
}

func (srv *LeaderboardService) ExistsAnyByUser(userId string) (bool, error) {
	count, err := srv.repository.CountAllByUser(userId)
	return count > 0, err
}

func (srv *LeaderboardService) CountUsers(excludeZero bool) (int64, error) {
	// check cache
	cacheKey := fmt.Sprintf("count_total_%v", excludeZero)
	if cacheResult, ok := srv.cache.Get(cacheKey); ok {
		return cacheResult.(int64), nil
	}

	count, err := srv.repository.CountUsers(excludeZero)
	if err != nil {
		srv.cache.SetDefault(cacheKey, count)
	}
	return count, err
}

func (srv *LeaderboardService) GetByInterval(interval *models.IntervalKey, pageParams *utils.PageParams, resolveUsers bool) (models.Leaderboard, error) {
	return srv.GetAggregatedByInterval(interval, nil, pageParams, resolveUsers)
}

func (srv *LeaderboardService) GetByIntervalAndUser(interval *models.IntervalKey, userId string, resolveUser bool) (models.Leaderboard, error) {
	return srv.GetAggregatedByIntervalAndUser(interval, userId, nil, resolveUser)
}

func (srv *LeaderboardService) GetAggregatedByInterval(interval *models.IntervalKey, by *uint8, pageParams *utils.PageParams, resolveUsers bool) (models.Leaderboard, error) {
	// check cache
	cacheKey := srv.getHash(interval, by, "", pageParams)
	if cacheResult, ok := srv.cache.Get(cacheKey); ok {
		return cacheResult.([]*models.LeaderboardItemRanked), nil
	}

	items, err := srv.repository.GetAllAggregatedByInterval(interval, by, pageParams.Limit(), pageParams.Offset())
	if err != nil {
		return nil, err
	}

	if resolveUsers {
		users, err := srv.userService.GetManyMapped(models.Leaderboard(items).UserIDs())
		if err != nil {
			config.Log().Error("failed to resolve users for leaderboard item", "error", err)
		} else {
			for _, item := range items {
				if u, ok := users[item.UserID]; ok {
					item.User = u
				}
			}
		}
	}

	srv.cache.SetDefault(cacheKey, items)
	return items, nil
}

func (srv *LeaderboardService) GetAggregatedByIntervalAndUser(interval *models.IntervalKey, userId string, by *uint8, resolveUser bool) (models.Leaderboard, error) {
	// check cache
	cacheKey := srv.getHash(interval, by, userId, nil)
	if cacheResult, ok := srv.cache.Get(cacheKey); ok {
		return cacheResult.([]*models.LeaderboardItemRanked), nil
	}

	items, err := srv.repository.GetAggregatedByUserAndInterval(userId, interval, by, 0, 0)
	if err != nil {
		return nil, err
	}

	if resolveUser {
		u, err := srv.userService.GetUserById(userId)
		if err != nil {
			config.Log().Error("failed to resolve user for leaderboard item", "error", err)
		} else {
			for _, item := range items {
				item.User = u
			}
		}
	}

	srv.cache.SetDefault(cacheKey, items)
	return items, nil
}

func (srv *LeaderboardService) GenerateByUser(user *models.User, interval *models.IntervalKey) (*models.LeaderboardItem, error) {
	err, from, to := helpers.ResolveIntervalTZ(interval, user.TZ())
	if err != nil {
		return nil, err
	}

	request := summarytypes.NewSummaryRequest(from, to, user)
	options := summarytypes.DefaultProcessingOptions()
	summary, err := srv.summaryService.Generate(request, options)
	if err != nil {
		return nil, err
	}

	// exclude unknown language (will also exclude browsing time by chrome-wakatime plugin)
	total := summary.TotalTime() - summary.TotalTimeByKey(models.SummaryLanguage, models.UnknownSummaryKey)
	return &models.LeaderboardItem{
		User:     user,
		UserID:   user.ID,
		Interval: (*interval)[0],
		Total:    total,
	}, nil
}

func (srv *LeaderboardService) GenerateAggregatedByUser(user *models.User, interval *models.IntervalKey, by uint8) ([]*models.LeaderboardItem, error) {
	err, from, to := helpers.ResolveIntervalTZ(interval, user.TZ())
	if err != nil {
		return nil, err
	}

	request := summarytypes.NewSummaryRequest(from, to, user)
	options := summarytypes.DefaultProcessingOptions()
	summary, err := srv.summaryService.Generate(request, options)
	if err != nil {
		return nil, err
	}

	summaryItems := *summary.GetByType(by)
	items := make([]*models.LeaderboardItem, 0, summaryItems.Len())

	for _, item := range summaryItems {
		// explicitly exclude unknown languages from leaderboard
		if item.Key == models.UnknownSummaryKey {
			continue
		}

		items = append(items, &models.LeaderboardItem{
			User:     user,
			UserID:   user.ID,
			Interval: (*interval)[0],
			By:       &by,
			Total:    summary.TotalTimeByKey(by, item.Key),
			Key:      &item.Key,
		})
	}

	return items, nil
}

func (srv *LeaderboardService) getHash(interval *models.IntervalKey, by *uint8, user string, pageParams *utils.PageParams) string {
	k := strings.Join(*interval, "__") + "__" + user
	if by != nil && !reflect.ValueOf(by).IsNil() {
		k += "__" + models.GetEntityColumn(*by)
	}
	if pageParams != nil {
		k += "__" + strconv.Itoa(pageParams.Page) + "__" + strconv.Itoa(pageParams.PageSize)
	}
	return k
}
