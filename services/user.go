package services

import (
	"errors"
	"fmt"
	"time"

	"log/slog"

	"github.com/duke-git/lancet/v2/convertor"
	"github.com/duke-git/lancet/v2/datetime"
	"github.com/gofrs/uuid/v5"
	"github.com/leandro-lugaresi/hub"
	"github.com/muety/wakapi/config"
	"github.com/muety/wakapi/internal/mail"
	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/repositories"
	"github.com/muety/wakapi/utils"
	"github.com/patrickmn/go-cache"
	"gorm.io/gorm"
)

type UserService struct {
	config      *config.Config
	cache       *cache.Cache
	eventBus    *hub.Hub
	mailService mail.IMailService
	repository  repositories.IUserRepository
}

func NewUserService(db *gorm.DB) *UserService {
	mailService := mail.NewMailService()
	userRepo := repositories.NewUserRepository(db)
	srv := &UserService{
		config:      config.Get(),
		eventBus:    config.EventBus(),
		cache:       cache.New(1*time.Hour, 2*time.Hour),
		mailService: mailService,
		repository:  userRepo,
	}

	sub1 := srv.eventBus.Subscribe(0, config.EventWakatimeFailure)
	go func(sub *hub.Subscription) {
		for m := range sub.Receiver {
			user := m.Fields[config.FieldUser].(*models.User)
			n := m.Fields[config.FieldPayload].(int)

			slog.Warn("resetting wakatime api key for user due to too many failures", "userID", user.ID, "failureCount", n)

			if _, err := srv.SetWakatimeApiCredentials(user, "", ""); err != nil {
				config.Log().Error("failed to set wakatime api key for user", "userID", user.ID)
			}

			if user.Email != "" {
				if err := mailService.SendWakatimeFailureNotification(user, n); err != nil {
					config.Log().Error("failed to send wakatime failure notification mail to user", "userID", user.ID)
				} else {
					slog.Info("sent wakatime connection failure mail", "userID", user.ID)
				}
			}
		}
	}(&sub1)

	return srv
}

func (srv *UserService) GetUserById(userId string) (*models.User, error) {
	if userId == "" {
		return nil, errors.New("user id must not be empty")
	}

	if u, ok := srv.cache.Get(userId); ok {
		return u.(*models.User), nil
	}

	u, err := srv.repository.FindOne(models.User{ID: userId})
	if err != nil {
		return nil, err
	}

	srv.cache.SetDefault(u.ID, u)
	return u, nil
}

func (srv *UserService) GetUserByKey(key string) (*models.User, error) {
	if key == "" {
		return nil, errors.New("key must not be empty")
	}

	if u, ok := srv.cache.Get(key); ok {
		return u.(*models.User), nil
	}

	u, err := srv.repository.FindOne(models.User{ApiKey: key})
	if err != nil {
		return nil, err
	}

	srv.cache.SetDefault(u.ID, u)
	return u, nil
}

func (srv *UserService) GetUserByEmail(email string) (*models.User, error) {
	if email == "" {
		return nil, errors.New("email must not be empty")
	}
	return srv.repository.FindOne(models.User{Email: email})
}

func (srv *UserService) GetUserByResetToken(resetToken string) (*models.User, error) {
	if resetToken == "" {
		return nil, errors.New("reset token must not be empty")
	}
	return srv.repository.FindOne(models.User{ResetToken: resetToken})
}

func (srv *UserService) GetUserByStripeCustomerId(customerId string) (*models.User, error) {
	if customerId == "" {
		return nil, errors.New("customer id must not be empty")
	}
	return srv.repository.FindOne(models.User{StripeCustomerId: customerId})
}

func (srv *UserService) GetAll() ([]*models.User, error) {
	return srv.repository.GetAll()
}

func (srv *UserService) GetAllMapped() (map[string]*models.User, error) {
	users, err := srv.repository.GetAll()
	if err != nil {
		return nil, err
	}
	return srv.MapUsersById(users), nil
}

func (srv *UserService) GetMany(ids []string) ([]*models.User, error) {
	return srv.repository.GetMany(ids)
}

func (srv *UserService) GetManyMapped(ids []string) (map[string]*models.User, error) {
	users, err := srv.repository.GetMany(ids)
	if err != nil {
		return nil, err
	}
	return srv.MapUsersById(users), nil
}

func (srv *UserService) GetAllByReports(reportsEnabled bool) ([]*models.User, error) {
	return srv.repository.GetAllByReports(reportsEnabled)
}

func (srv *UserService) GetAllByLeaderboard(leaderboardEnabled bool) ([]*models.User, error) {
	return srv.repository.GetAllByLeaderboard(leaderboardEnabled)
}

func (srv *UserService) GetActive(exact bool) ([]*models.User, error) {
	minDate := time.Now().AddDate(0, 0, -1*srv.config.App.InactiveDays)
	if !exact {
		minDate = datetime.BeginOfHour(minDate)
	}

	cacheKey := fmt.Sprintf("%s--active", minDate.String())
	if u, ok := srv.cache.Get(cacheKey); ok {
		return u.([]*models.User), nil
	}

	results, err := srv.repository.GetByLastActiveAfter(minDate)
	if err != nil {
		return nil, err
	}

	srv.cache.SetDefault(cacheKey, results)
	return results, nil
}

func (srv *UserService) Count() (int64, error) {
	return srv.repository.Count()
}

func (srv *UserService) MakeApiKey() string {
	// fmt.Sprintf("wakana_%s", uuid.Must(uuid.NewV4()).String())
	return fmt.Sprintf("%s", uuid.Must(uuid.NewV4()).String())
}

func (srv *UserService) Create(signup *models.Signup) (*models.User, error) {
	u := &models.User{
		ID:        uuid.Must(uuid.NewV4()).String(),
		ApiKey:    srv.MakeApiKey(),
		Email:     signup.Email,
		Location:  signup.Location,
		Password:  signup.Password,
		InvitedBy: signup.InvitedBy,
	}

	if hash, err := utils.HashPassword(u.Password, srv.config.Security.PasswordSalt); err != nil {
		return nil, err
	} else {
		u.Password = hash
	}

	return srv.repository.Create(u)
}

func (srv *UserService) CreateOrGet(signup *models.Signup, isAdmin bool) (*models.User, bool, error) {
	u := &models.User{
		ID:        uuid.Must(uuid.NewV4()).String(),
		ApiKey:    fmt.Sprintf("wakana_%s", uuid.Must(uuid.NewV4()).String()),
		Email:     signup.Email,
		Location:  signup.Location,
		Password:  signup.Password,
		IsAdmin:   isAdmin,
		InvitedBy: signup.InvitedBy,
	}

	if hash, err := utils.HashPassword(u.Password, srv.config.Security.PasswordSalt); err != nil {
		return nil, false, err
	} else {
		u.Password = hash
	}

	return srv.repository.InsertOrGet(u)
}

func (srv *UserService) Update(user *models.User) (*models.User, error) {
	srv.FlushUserCache(user.ID)
	srv.notifyUpdate(user)
	return srv.repository.Update(user)
}

func (srv *UserService) ResetApiKey(user *models.User) (*models.User, error) {
	srv.FlushUserCache(user.ID)
	user.ApiKey = uuid.Must(uuid.NewV4()).String()
	return srv.Update(user)
}

func (srv *UserService) SetWakatimeApiCredentials(user *models.User, apiKey string, apiUrl string) (*models.User, error) {
	srv.FlushUserCache(user.ID)

	if apiKey != user.WakatimeApiKey {
		if u, err := srv.repository.UpdateField(user, "wakatime_api_key", apiKey); err != nil {
			return u, err
		}
	}

	if apiUrl != user.WakatimeApiUrl {
		return srv.repository.UpdateField(user, "wakatime_api_url", apiUrl)
	}

	return user, nil
}

func (srv *UserService) GenerateResetToken(user *models.User) (*models.User, error) {
	return srv.repository.UpdateField(user, "reset_token", uuid.Must(uuid.NewV4()))
}

func (srv *UserService) Delete(user *models.User) error {
	srv.FlushUserCache(user.ID)

	user.ReportsWeekly = false
	srv.notifyUpdate(user)
	srv.notifyDelete(user)

	return srv.repository.Delete(user)
}

func (srv *UserService) MapUsersById(users []*models.User) map[string]*models.User {
	return convertor.ToMap[*models.User, string, *models.User](users, func(u *models.User) (string, *models.User) {
		return u.ID, u
	})
}

func (srv *UserService) FlushCache() {
	srv.cache.Flush()
}

func (srv *UserService) FlushUserCache(userId string) {
	srv.cache.Delete(userId)
}

func (srv *UserService) notifyUpdate(user *models.User) {
	srv.eventBus.Publish(hub.Message{
		Name:   config.EventUserUpdate,
		Fields: map[string]interface{}{config.FieldPayload: user},
	})
}

func (srv *UserService) notifyDelete(user *models.User) {
	srv.eventBus.Publish(hub.Message{
		Name:   config.EventUserDelete,
		Fields: map[string]interface{}{config.FieldPayload: user},
	})
}

type IUserService interface {
	GetUserById(string) (*models.User, error)
	GetUserByKey(string) (*models.User, error)
	GetUserByEmail(string) (*models.User, error)
	GetUserByResetToken(string) (*models.User, error)
	GetUserByStripeCustomerId(string) (*models.User, error)
	GetAll() ([]*models.User, error)
	GetAllMapped() (map[string]*models.User, error)
	GetMany([]string) ([]*models.User, error)
	GetManyMapped([]string) (map[string]*models.User, error)
	GetAllByReports(bool) ([]*models.User, error)
	GetAllByLeaderboard(bool) ([]*models.User, error)
	GetActive(bool) ([]*models.User, error)
	Count() (int64, error)
	CreateOrGet(*models.Signup, bool) (*models.User, bool, error)
	Update(*models.User) (*models.User, error)
	Delete(*models.User) error
	ResetApiKey(*models.User) (*models.User, error)
	SetWakatimeApiCredentials(*models.User, string, string) (*models.User, error)
	GenerateResetToken(*models.User) (*models.User, error)
	FlushCache()
	FlushUserCache(string)
	Create(signup *models.Signup) (*models.User, error)
	MakeApiKey() string
}
