package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt"

	conf "github.com/muety/wakapi/config"
	"github.com/muety/wakapi/helpers"
	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/services"
	"github.com/muety/wakapi/utils"
	"gorm.io/gorm"
)

var JWT_TOKEN_DURATION = time.Hour * 24

type AuthApiHandler struct {
	db          *gorm.DB
	config      *conf.Config
	userService services.IUserService
}

func NewAuthApiHandler(db *gorm.DB, userService services.IUserService) *AuthApiHandler {
	return &AuthApiHandler{db: db, userService: userService, config: conf.Get()}
}

func (h *AuthApiHandler) RegisterRoutes(router chi.Router) {
	router.Post("/auth/signup", h.SignUp)
	router.Post("/auth/login", h.Signin)
	router.Get("/auth/validate", h.ValidateAuthToken)
}

type SignUpParams struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	PasswordRepeat string `json:"password_repeat"`
}

type LoginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// @Summary register a new user
// @ID post-auth-signup
// @Tags misc
// @Produce plain
// @Success 200 {string} string
// @Router /auth [post]
func (h *AuthApiHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var params = &SignUpParams{}

	jsonDecoder := json.NewDecoder(r.Body)
	err := jsonDecoder.Decode(params)
	fmt.Println(params)
	if err != nil || params.Email == "" || params.Password == "" || params.PasswordRepeat == "" {
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Bad Request",
			"status":  http.StatusBadRequest,
		})
		return
	}

	if !models.ValidateIsValidEmail(params.Email) {
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Bad Request. Invalid email",
			"status":  http.StatusBadRequest,
		})
		return
	}

	if params.Password != params.PasswordRepeat {
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Passwords do not match",
			"status":  http.StatusBadRequest,
		})
		return
	}

	signup := &models.Signup{
		Email:          params.Email,
		Password:       params.Password,
		PasswordRepeat: params.PasswordRepeat,
	}

	h.userService.CreateOrGet(signup, false)
	response := map[string]interface{}{
		"message": "Signup successful",
		"status":  http.StatusCreated,
	}
	helpers.RespondJSON(w, r, http.StatusCreated, response)
}

func (h *AuthApiHandler) Signin(w http.ResponseWriter, r *http.Request) {

	var params = &LoginParams{}
	jsonDecoder := json.NewDecoder(r.Body)
	err := jsonDecoder.Decode(params)

	if err != nil || params.Email == "" || params.Password == "" {
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Bad Request",
			"status":  http.StatusBadRequest,
		})
		return
	}

	user, err := h.userService.GetUserByEmail(params.Email)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Invalid credentials",
			"status":  http.StatusBadRequest,
		})
		return
	}

	if !utils.ComparePassword(user.Password, params.Password, h.config.Security.PasswordSalt) {
		w.WriteHeader(http.StatusUnauthorized)
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Invalid credentials",
			"status":  http.StatusBadRequest,
		})
		return
	}

	user.LastLoggedInAt = models.CustomTime(time.Now())
	h.userService.Update(user)

	token, err := MakeLoginJWT(user.ID, h.config)
	if err != nil {
		helpers.RespondJSON(w, r, http.StatusBadRequest, map[string]interface{}{
			"message": "Internal Server Error. Try again",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	helpers.RespondJSON(w, r, http.StatusCreated, map[string]interface{}{
		"message": "Login successful",
		"status":  http.StatusCreated,
		"data": map[string]interface{}{
			"token": token,
			"user": map[string]interface{}{
				"id":     user.ID,
				"email":  user.Email,
				"avatar": h.config.Server.PublicUrl + "/" + user.AvatarURL(h.config.App.AvatarURLTemplate),
			},
		},
	})
}

func MakeLoginJWT(userId string, conf *conf.Config) (string, error) {
	atClaims := jwt.MapClaims{}
	atClaims["exp"] = time.Now().Add(JWT_TOKEN_DURATION).Unix()
	atClaims["uid"] = userId
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)

	token, err := at.SignedString([]byte(conf.Security.JWT_SECRET))
	if err != nil {
		return "", err
	}

	return token, nil
}

func (h *AuthApiHandler) ValidateAuthToken(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("token")

	if token == "" {
		helpers.RespondJSON(w, r, http.StatusUnauthorized, map[string]interface{}{
			"message": "Unauthorized",
			"status":  http.StatusUnauthorized,
		})
	}

	claim, err := utils.GetTokenClaims(token, h.config.Security.JWT_SECRET)
	if err != nil || claim.UID == "" {
		helpers.RespondJSON(w, r, http.StatusUnauthorized, map[string]interface{}{
			"message": "Unauthorized: Invalid or expired token",
			"status":  http.StatusUnauthorized,
		})
		return
	}

	helpers.RespondJSON(w, r, http.StatusAccepted, map[string]interface{}{
		"message": "Token is valid",
		"status":  http.StatusAccepted,
	})
}