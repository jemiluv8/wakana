package api

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/muety/wakapi/config"
	"github.com/muety/wakapi/middlewares"
	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/services"
	"github.com/muety/wakapi/utils"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	config     *config.Config
	userSrvc   services.IUserService
	httpClient *http.Client
	db         *gorm.DB
}

type actionResult struct {
	Code    int                    `json:"code"`
	Message string                 `json:"message,omitempty"`
	Error   string                 `json:"error,omitempty"`
	Values  map[string]interface{} `json:"values,omitempty"`
}

func NewSettingsHandler(userService services.IUserService, db *gorm.DB) *SettingsHandler {
	return &SettingsHandler{
		config:     config.Get(),
		userSrvc:   userService,
		httpClient: &http.Client{Timeout: 10 * time.Second},
		db:         db,
	}
}

func (h *SettingsHandler) RegisterRoutes(router chi.Router) {
	router.Group(func(r chi.Router) {
		r.Use(
			middlewares.NewAuthenticateMiddleware(h.userSrvc).Handler,
		)
		r.Post("/settings", h.PostIndex)
		r.Get("/profile", h.GetProfile)
		r.Put("/profile", h.SaveProfile)
	})
}

type WakatimeSettingsPayload struct {
	ApiKey string `json:"api_key"`
	ApiUrl string `json:"api_url"`
}

type SettingsPayload struct {
	Action string `json:"action"`
	WakatimeSettingsPayload
}

func (h *SettingsHandler) PostIndex(w http.ResponseWriter, r *http.Request) {
	user := middlewares.GetPrincipal(r)

	var reqBody = &SettingsPayload{}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if reqBody.Action != "toggle_wakatime" {
		h.respondWithError(w, http.StatusBadRequest, "Unknown action")
		return
	}

	result := h.actionSetWakatimeApiKey(reqBody, user)
	if result.Code != -1 {
		h.respondWithJSON(w, result.Code, result)
	}
}

func (h *SettingsHandler) SaveProfile(w http.ResponseWriter, r *http.Request) {
	user := middlewares.GetPrincipal(r)

	var reqBody = &models.Profile{}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	fmt.Println("Saving the fucker")

	result := h.db.Model(user).Updates(reqBody)
	if err := result.Error; err != nil {
		h.respondWithJSON(w, 400, map[string]interface{}{
			"code":  400,
			"error": err.Error(),
		})
	}
	h.respondWithJSON(w, 200, user)
}

func (h *SettingsHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	user := middlewares.GetPrincipal(r)
	defer h.userSrvc.FlushCache()
	h.respondWithJSON(w, 200, user)
}

func (h *SettingsHandler) actionSetWakatimeApiKey(wakatimeSettings *SettingsPayload, user *models.User) actionResult {
	if wakatimeSettings.ApiKey == "" {
		return actionResult{http.StatusBadRequest, "", "invalid input: no or invalid api key", nil}
	}

	if !h.validateWakatimeKey(wakatimeSettings.ApiKey, wakatimeSettings.ApiUrl) {
		return actionResult{http.StatusBadRequest, "", "invalid input: failed to validate api key against wakatime server", nil}
	}

	if _, err := h.userSrvc.SetWakatimeApiCredentials(user, wakatimeSettings.ApiKey, wakatimeSettings.ApiUrl); err != nil {
		return actionResult{http.StatusInternalServerError, "", config.ErrInternalServerError, nil}
	}

	return actionResult{http.StatusOK, "Wakatime API key set", "", nil}
}

func (h *SettingsHandler) actionUpdateHeartbeatsTimeout(w http.ResponseWriter, r *http.Request) actionResult {
	var err error
	user := middlewares.GetPrincipal(r)
	defer h.userSrvc.FlushCache()

	val, err := strconv.ParseInt(r.PostFormValue("heartbeats_timeout"), 0, 0)
	if dur := time.Duration(val) * time.Second; err != nil || dur < models.MinHeartbeatsTimeout || dur > models.MaxHeartbeatsTimeout {
		return actionResult{http.StatusBadRequest, "", "invalid input", nil}
	}
	user.HeartbeatsTimeoutSec = int(val)

	if _, err := h.userSrvc.Update(user); err != nil {
		return actionResult{http.StatusInternalServerError, "", "internal sever error", nil}
	}

	return actionResult{http.StatusOK, "Done. To apply this change to already existing data, please regenerate your summaries.", "", nil}
}

func (h *SettingsHandler) respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		h.respondWithError(w, http.StatusInternalServerError, config.ErrInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(response)
}

func (h *SettingsHandler) respondWithError(w http.ResponseWriter, code int, message string) {
	h.respondWithJSON(w, code, map[string]string{"error": message})
}

func (h *SettingsHandler) validateWakatimeKey(apiKey string, baseUrl string) bool {
	if baseUrl == "" {
		baseUrl = config.WakatimeApiUrl
	}

	headers := http.Header{
		"Accept": []string{"application/json"},
		"Authorization": []string{
			fmt.Sprintf("Basic %s", base64.StdEncoding.EncodeToString([]byte(apiKey))),
		},
	}

	request, err := http.NewRequest(
		http.MethodGet,
		baseUrl+config.WakatimeApiUserUrl,
		nil,
	)
	if err != nil {
		return false
	}

	request.Header = headers

	if _, err = utils.RaiseForStatus(h.httpClient.Do(request)); err != nil {
		return false
	}

	return true
}
