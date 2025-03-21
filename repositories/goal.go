package repositories

import (
	"github.com/muety/wakapi/models"
	"gorm.io/gorm"
)

type GoalRepository struct {
	db *gorm.DB
}

func NewGoalRepository(db *gorm.DB) *GoalRepository {
	return &GoalRepository{db: db}
}

func (r *GoalRepository) DeleteByIdAndUser(goalId, userID string) error {
	if err := r.db.
		Where("id = ?", goalId).
		Where("user_id = ?", userID).
		Delete(models.Goal{}).Error; err != nil {
		return err
	}
	return nil
}

func (r *GoalRepository) FindOne(attributes models.Goal) (*models.Goal, error) {
	u := &models.Goal{}
	if err := r.db.Where(&attributes).First(u).Error; err != nil {
		return u, err
	}
	return u, nil
}

func (r *GoalRepository) Update(goal *models.Goal) (*models.Goal, error) {
	updateMap := map[string]interface{}{
		"custom_title": goal.CustomTitle,
	}

	result := r.db.Model(goal).Updates(updateMap)
	if err := result.Error; err != nil {
		return nil, err
	}

	return goal, nil
}

func (r *GoalRepository) GetByIdForUser(goalID, userID string) (*models.Goal, error) {
	g := &models.Goal{}

	err := r.db.Where(models.Goal{ID: goalID, UserID: userID}).First(g).Error
	if err != nil {
		return g, err
	}

	if g.ID != "" {
		return g, nil
	}
	return nil, err
}

func (r *GoalRepository) Create(goal *models.Goal) (*models.Goal, error) {
	result := r.db.Create(goal)
	if err := result.Error; err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *GoalRepository) FetchUserGoals(userID string) ([]*models.Goal, error) {
	var goals []*models.Goal
	if err := r.db.
		Order("created_at desc").
		Limit(100). // TODO: paginate
		Where(&models.Goal{UserID: userID}).
		Find(&goals).Error; err != nil {
		return nil, err
	}
	return goals, nil
}

type IGoalRepository interface {
	Create(*models.Goal) (*models.Goal, error)
	GetByIdForUser(id, userID string) (*models.Goal, error)
	DeleteByIdAndUser(id, userID string) error
	FetchUserGoals(id string) ([]*models.Goal, error)
	Update(goal *models.Goal) (*models.Goal, error)
}
