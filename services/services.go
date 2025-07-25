package services

import (
	"time"

	datastructure "github.com/duke-git/lancet/v2/datastructure/set"
	"github.com/muety/wakapi/models"
	summarytypes "github.com/muety/wakapi/types"
	"github.com/muety/wakapi/utils"
	"gorm.io/gorm"
)

type IAggregationService interface {
	AggregateSummaries(set datastructure.Set[string]) error
}

type IMiscService interface {
	Schedule()
	CountTotalTime()
}

type IAliasService interface {
	Create(*models.Alias) (*models.Alias, error)
	Delete(*models.Alias) error
	DeleteMulti([]*models.Alias) error
	IsInitialized(string) bool
	InitializeUser(string) error
	GetByUser(string) ([]*models.Alias, error)
	GetByUserAndType(string, uint8) ([]*models.Alias, error)
	GetByUserAndKeyAndType(string, string, uint8) ([]*models.Alias, error)
	GetAliasOrDefault(string, uint8, string) (string, error)
}

type IHeartbeatService interface {
	Insert(*models.Heartbeat) error
	InsertBatch([]*models.Heartbeat) error
	Count(bool) (int64, error)
	CountByUser(*models.User) (int64, error)
	CountByUsers([]*models.User) ([]*models.CountByUser, error)
	GetAllWithin(time.Time, time.Time, *models.User) ([]*models.Heartbeat, error)
	GetAllWithinByFilters(time.Time, time.Time, *models.User, *models.Filters) ([]*models.Heartbeat, error)
	GetFirstByUsers() ([]*models.TimeByUser, error)
	GetLatestByUser(*models.User) (*models.Heartbeat, error)
	GetLatestByOriginAndUser(string, *models.User) (*models.Heartbeat, error)
	GetLatestByFilters(*models.User, *models.Filters) (*models.Heartbeat, error)
	GetEntitySetByUser(uint8, string) ([]string, error)
	DeleteBefore(time.Time) error
	DeleteByUser(*models.User) error
	DeleteByUserBefore(*models.User, time.Time) error
	GetUserProjectStats(*models.User, time.Time, time.Time, *utils.PageParams, bool) ([]*models.ProjectStats, error)
	GetHeartbeatsWritePercentage(userID string, start, end time.Time) (float64, error)
}

type IDiagnosticsService interface {
	Create(*models.Diagnostics) (*models.Diagnostics, error)
}

type IKeyValueService interface {
	GetString(string) (*models.KeyStringValue, error)
	MustGetString(string) *models.KeyStringValue
	GetByPrefix(string) ([]*models.KeyStringValue, error)
	PutString(*models.KeyStringValue) error
	DeleteString(string) error
}

type ILanguageMappingService interface {
	GetById(uint) (*models.LanguageMapping, error)
	GetByUser(string) ([]*models.LanguageMapping, error)
	ResolveByUser(string) (map[string]string, error)
	Create(*models.LanguageMapping) (*models.LanguageMapping, error)
	Delete(mapping *models.LanguageMapping) error
}

type IProjectLabelService interface {
	GetById(uint) (*models.ProjectLabel, error)
	GetByUser(string) ([]*models.ProjectLabel, error)
	GetByUserGrouped(string) (map[string][]*models.ProjectLabel, error)
	GetByUserGroupedInverted(string) (map[string][]*models.ProjectLabel, error)
	Create(*models.ProjectLabel) (*models.ProjectLabel, error)
	Delete(*models.ProjectLabel) error
}

type IDurationService interface {
	Get(time.Time, time.Time, *models.User, *models.Filters, string) (models.Durations, error)
	MakeDurationsFromHeartbeats(models.ProcessHeartbeatsArgs, *models.Filters) (models.Durations, error)
}

type ISummaryService interface {
	// Core summary generation - tells the complete story
	Generate(request *summarytypes.SummaryRequest, options *summarytypes.ProcessingOptions) (*models.Summary, error)
	
	// Convenience methods for common scenarios  
	QuickSummary(from, to time.Time, user *models.User) (*models.Summary, error)
	DetailedSummary(request *summarytypes.SummaryRequest) (*models.Summary, error)
	
	// Strategy-specific methods
	RetrieveFromStorage(request *summarytypes.SummaryRequest) (*models.Summary, error)
	ComputeFromDurations(request *summarytypes.SummaryRequest) (*models.Summary, error)
	
	// CRUD operations
	GetLatestByUser() ([]*models.TimeByUser, error)
	DeleteByUser(string) error
	DeleteByUserBefore(string, time.Time) error
	Insert(*models.Summary) error
	GetHeartbeatsWritePercentage(userID string, start time.Time, end time.Time) (float64, error)
}

type IActivityService interface {
	GetChart(*models.User, *models.IntervalKey, bool, bool, bool) (string, error)
}

type IReportService interface {
	SendReport(*models.User, time.Duration) error
	SendWeeklyReports() error
}

type IHousekeepingService interface {
	CleanUserDataBefore(*models.User, time.Time) error
	CleanInactiveUsers(time.Time) error
}

type ILeaderboardService interface {
	GetDefaultScope() *models.IntervalKey
	GenerateLeaderboards() error
	GenerateLeaderboardsForInterval(*models.IntervalKey) error
	GenerateWeeklyLeaderboards() error
	ComputeLeaderboard([]*models.User, *models.IntervalKey, []uint8) error
	ExistsAnyByUser(string) (bool, error)
	CountUsers(bool) (int64, error)
	GetByInterval(*models.IntervalKey, *utils.PageParams, bool) (models.Leaderboard, error)
	GetByIntervalAndUser(*models.IntervalKey, string, bool) (models.Leaderboard, error)
	GetAggregatedByInterval(*models.IntervalKey, *uint8, *utils.PageParams, bool) (models.Leaderboard, error)
	GetAggregatedByIntervalAndUser(*models.IntervalKey, string, *uint8, bool) (models.Leaderboard, error)
	GenerateByUser(*models.User, *models.IntervalKey) (*models.LeaderboardItem, error)
	GenerateAggregatedByUser(*models.User, *models.IntervalKey, uint8) ([]*models.LeaderboardItem, error)
}

type IServices interface {
	Alias() IAliasService
	Users() IUserService
	LanguageMapping() ILanguageMappingService
	ProjectLabel() IProjectLabelService
	Duration() IDurationService
	Summary() ISummaryService
	LeaderBoard() ILeaderboardService
	Aggregation() IAggregationService
	KeyValue() IKeyValueService
	Report() IReportService
	Activity() IActivityService
	Diagnostics() IDiagnosticsService
	HouseKeeping() IHousekeepingService
	Misc() IMiscService
	Goal() IGoalService
	OAuth() IUserOauthService
	UserAgentPlugin() IPluginUserAgentService
	Client() IClientService
	Invoice() IInvoiceService
	Heartbeat() IHeartbeatService
	Otp() IOTPService
}

type Services struct {
	alias           IAliasService
	users           IUserService
	languageMapping ILanguageMappingService
	projectLabel    IProjectLabelService
	duration        IDurationService
	summary         ISummaryService
	leaderBoard     ILeaderboardService
	aggregation     IAggregationService
	keyValue        IKeyValueService
	report          IReportService
	activity        IActivityService
	diagnostics     IDiagnosticsService
	houseKeeping    IHousekeepingService
	misc            IMiscService
	goal            IGoalService
	oauth           IUserOauthService
	userAgentPlugin IPluginUserAgentService
	client          IClientService
	invoice         IInvoiceService
	heartbeat       IHeartbeatService
	otp             IOTPService
}

// Implement the IServices interface
func (s *Services) Users() IUserService {
	return s.users
}

func (s *Services) Alias() IAliasService {
	return s.alias
}

func (s *Services) LanguageMapping() ILanguageMappingService {
	return s.languageMapping
}

func (s *Services) ProjectLabel() IProjectLabelService {
	return s.projectLabel
}

func (s *Services) Duration() IDurationService {
	return s.duration
}

func (s *Services) Summary() ISummaryService {
	return s.summary
}

func (s *Services) LeaderBoard() ILeaderboardService {
	return s.leaderBoard
}

func (s *Services) Aggregation() IAggregationService {
	return s.aggregation
}

func (s *Services) KeyValue() IKeyValueService {
	return s.keyValue
}

func (s *Services) Report() IReportService {
	return s.report
}

func (s *Services) Activity() IActivityService {
	return s.activity
}

func (s *Services) Diagnostics() IDiagnosticsService {
	return s.diagnostics
}

func (s *Services) HouseKeeping() IHousekeepingService {
	return s.houseKeeping
}

func (s *Services) Misc() IMiscService {
	return s.misc
}

func (s *Services) Goal() IGoalService {
	return s.goal
}

func (s *Services) OAuth() IUserOauthService {
	return s.oauth
}

func (s *Services) UserAgentPlugin() IPluginUserAgentService {
	return s.userAgentPlugin
}

func (s *Services) Client() IClientService {
	return s.client
}

func (s *Services) Invoice() IInvoiceService {
	return s.invoice
}

func (s *Services) Heartbeat() IHeartbeatService {
	return s.heartbeat
}

func (s *Services) Otp() IOTPService {
	return s.otp
}

func NewServices(db *gorm.DB) IServices {
	return &Services{
		users:           NewUserService(db),
		languageMapping: NewLanguageMappingService(db),
		projectLabel:    NewProjectLabelService(db),
		duration:        NewDurationService(db),
		summary:         NewSummaryService(db),
		leaderBoard:     NewLeaderboardService(db),
		aggregation:     NewAggregationService(db),
		keyValue:        NewKeyValueService(db),
		report:          NewReportService(db),
		activity:        NewActivityService(db),
		diagnostics:     NewDiagnosticsService(db),
		houseKeeping:    NewHousekeepingService(db),
		misc:            NewMiscService(db),
		goal:            NewGoalService(db),
		oauth:           NewUserOauthService(db),
		userAgentPlugin: NewPluginUserAgentService(db),
		client:          NewClientService(db),
		invoice:         NewInvoiceService(db),
		heartbeat:       NewHeartbeatService(db),
		otp:             NewOTPService(db),
	}
}
