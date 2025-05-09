package utilities

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/muety/wakapi/middlewares"
	"github.com/muety/wakapi/mocks"
	"github.com/muety/wakapi/models"
	"github.com/stretchr/testify/assert"
)

func TestCheckEffectiveUser_Current(t *testing.T) {
	// request current as normal user -> return myself
	r, w, userServiceMock := mockUserAwareRequest("current", "user1")
	user, err := CheckEffectiveUser(w, r, userServiceMock, "current")
	assert.Nil(t, err)
	assert.Equal(t, "user1", user.ID)
	userServiceMock.AssertNumberOfCalls(t, "GetUserById", 0)
}

func TestCheckEffectiveUser_Other(t *testing.T) {
	// request someone else as admin -> return someone else
	r, w, userServiceMock := mockUserAwareRequest("user2", "admin")
	user, err := CheckEffectiveUser(w, r, userServiceMock, "current")
	assert.Nil(t, err)
	assert.Equal(t, "user2", user.ID)
	userServiceMock.AssertCalled(t, "GetUserById", "user2")
	userServiceMock.AssertNumberOfCalls(t, "GetUserById", 1)
}

func TestCheckEffectiveUser_FallbackUnauthorized(t *testing.T) {
	// request someone else as non-admin -> error
	r, w, userServiceMock := mockUserAwareRequest("user2", "user1")
	user, err := CheckEffectiveUser(w, r, userServiceMock, "current")
	assert.NotNil(t, err)
	assert.Nil(t, user)
	userServiceMock.AssertNumberOfCalls(t, "GetUserById", 0)
}

func TestCheckEffectiveUser_FallbackEmpty(t *testing.T) {
	// request none -> return myself
	r, w, userServiceMock := mockUserAwareRequest("", "user1")
	user, err := CheckEffectiveUser(w, r, userServiceMock, "current")
	assert.Nil(t, err)
	assert.Equal(t, "user1", user.ID)
	userServiceMock.AssertNumberOfCalls(t, "GetUserById", 0)
}

func TestCheckEffectiveUser_FallbackUnauthenticated(t *testing.T) {
	// request anyone without authentication -> error
	r, w, userServiceMock := mockUserAwareRequest("user1", "")
	user, err := CheckEffectiveUser(w, r, userServiceMock, "current")
	assert.NotNil(t, err)
	assert.Nil(t, user)
	userServiceMock.AssertNumberOfCalls(t, "GetUserById", 0)
}

func mockUserAwareRequest(requestedUser, authorizedUser string) (*http.Request, http.ResponseWriter, *mocks.UserServiceMock) {
	testUser := models.User{
		ID:      authorizedUser,
		IsAdmin: authorizedUser == "admin",
	}

	testPrincipal := middlewares.PrincipalContainer{}
	if authorizedUser != "" {
		testPrincipal.SetPrincipal(&testUser)
	}

	r := httptest.NewRequest("GET", "http://localhost:3000/api/{user}/data", nil)
	r = WithUrlParam(r, "user", requestedUser)
	r = r.WithContext(context.WithValue(r.Context(), "principal", &testPrincipal))

	userServiceMock := new(mocks.UserServiceMock)
	userServiceMock.On("GetUserById", "user1").Return(&models.User{ID: "user1"}, nil)
	userServiceMock.On("GetUserById", "user2").Return(&models.User{ID: "user2"}, nil)
	userServiceMock.On("GetUserById", "admin").Return(&models.User{ID: "admin"}, nil)

	return r, httptest.NewRecorder(), userServiceMock
}
