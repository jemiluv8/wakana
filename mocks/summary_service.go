package mocks

import (
	"time"

	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/models/types"
	"github.com/stretchr/testify/mock"
)

type SummaryServiceMock struct {
	mock.Mock
}

func (m *SummaryServiceMock) Aliased(t time.Time, t2 time.Time, u *models.User, r types.SummaryRetriever, f *models.Filters, b bool) (*models.Summary, error) {
	args := m.Called(t, t2, u, r, f)
	return args.Get(0).(*models.Summary), args.Error(1)
}

func (m *SummaryServiceMock) RetrieveWithAliases(t time.Time, t2 time.Time, u *models.User, f *models.Filters, b bool) (*models.Summary, error) {
	args := m.Called(t, t2, u, f, b)
	return args.Get(0).(*models.Summary), args.Error(1)
}

func (m *SummaryServiceMock) SummarizeWithAliases(t time.Time, t2 time.Time, u *models.User, f *models.Filters, b bool) (*models.Summary, error) {
	args := m.Called(t, t2, u, f, b)
	return args.Get(0).(*models.Summary), args.Error(1)
}

func (m *SummaryServiceMock) Retrieve(t time.Time, t2 time.Time, u *models.User, f *models.Filters) (*models.Summary, error) {
	args := m.Called(t, t2, u, f)
	return args.Get(0).(*models.Summary), args.Error(1)
}

func (m *SummaryServiceMock) GetHeartbeatsWritePercentage(userID string, start, end time.Time) (float64, error) {
	args := m.Called(userID, start, end)
	return 50, args.Error(0)
}

func (m *SummaryServiceMock) Summarize(t time.Time, t2 time.Time, u *models.User, f *models.Filters) (*models.Summary, error) {
	args := m.Called(t, t2, u, f)
	return args.Get(0).(*models.Summary), args.Error(1)
}

func (m *SummaryServiceMock) GetLatestByUser() ([]*models.TimeByUser, error) {
	args := m.Called()
	return args.Get(0).([]*models.TimeByUser), args.Error(1)
}

func (m *SummaryServiceMock) DeleteByUser(s string) error {
	args := m.Called(s)
	return args.Error(0)
}

func (m *SummaryServiceMock) DeleteByUserBefore(s string, t time.Time) error {
	args := m.Called(s, t)
	return args.Error(0)
}

func (m *SummaryServiceMock) Insert(s *models.Summary) error {
	args := m.Called(s)
	return args.Error(0)
}
