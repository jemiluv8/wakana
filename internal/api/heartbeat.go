package api

import (
	"net/http"

	"github.com/duke-git/lancet/v2/condition"
	"github.com/go-chi/chi/v5"
	"github.com/muety/wakapi/helpers"
	"github.com/muety/wakapi/internal/utilities"
	"github.com/rs/cors"

	conf "github.com/muety/wakapi/config"
	"github.com/muety/wakapi/middlewares"
	customMiddleware "github.com/muety/wakapi/middlewares/custom"
	v1 "github.com/muety/wakapi/models/compat/wakatime/v1"
	"github.com/muety/wakapi/services"
	"github.com/muety/wakapi/utils"

	"github.com/muety/wakapi/models"
	routeutils "github.com/muety/wakapi/routes/utils"
)

func (a *APIv1) RegisterRoutes(router chi.Router) {
	router.Group(func(r chi.Router) {
		r.Use(
			middlewares.NewAuthenticateMiddleware(a.services.Users()).WithOptionalForMethods(http.MethodOptions).Handler,
			customMiddleware.NewWakatimeRelayMiddleware().Handler,
		)
		if a.config.IsDev() {
			r.Use(
				customMiddleware.NewWakatimeRelayMiddleware().OtherInstancesHandler,
			)
		}
		// see https://github.com/muety/wakapi/issues/203
		r.Post("/heartbeat", a.ProcessHeartBeat)
		r.Post("/heartbeats", a.ProcessHeartBeat)
		r.Post("/users/{user}/heartbeats", a.ProcessHeartBeat)
		r.Post("/users/{user}/heartbeats.bulk", a.ProcessHeartBeat)
		r.Post("/v1/users/{user}/heartbeats", a.ProcessHeartBeat)
		r.Post("/v1/users/{user}/heartbeats.bulk", a.ProcessHeartBeat)
		r.Post("/compat/wakatime/v1/users/{user}/heartbeats", a.ProcessHeartBeat)
		r.Post("/compat/wakatime/v1/users/{user}/heartbeats.bulk", a.ProcessHeartBeat)

		// https://github.com/muety/wakapi/issues/690
		for _, route := range r.Routes() {
			r.Options(route.Pattern, cors.AllowAll().HandlerFunc)
		}
	})
}

// @Summary Push a new heartbeat
// @ID post-heartbeat
// @Tags heartbeat
// @Accept json
// @Param heartbeat body models.Heartbeat true "A single heartbeat"
// @Security ApiKeyAuth
// @Success 201
// @Router /heartbeat [post]
func (a *APIv1) ProcessHeartBeat(w http.ResponseWriter, r *http.Request) {
	user, err := utilities.CheckEffectiveUser(w, r, a.services.Users(), "current")
	if err != nil {
		return // response was already sent by util function
	}

	var heartbeats []*models.Heartbeat
	heartbeats, err = routeutils.ParseHeartbeats(r)
	if err != nil {
		conf.Log().Request(r).Error("error occurred", "error", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	userAgent := r.Header.Get("User-Agent")
	ua, err := models.NewPluginUserAgent(userAgent, "")
	var opSys, editor string
	if err == nil {
		opSys = ua.OS
		editor = ua.Editor
	} else {
		operatingSystem, agentEditor, _ := utils.ParseUserAgent(userAgent)
		opSys = operatingSystem
		editor = agentEditor
	}
	machineName := r.Header.Get("X-Machine-Name")

	for _, hb := range heartbeats {
		if hb == nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("invalid heartbeat object"))
			return
		}

		// TODO: unit test this
		if hb.UserAgent != "" {
			userAgent = hb.UserAgent
			ua, err := models.NewPluginUserAgent(hb.UserAgent, "")
			if err == nil {
				opSys = ua.OS
				editor = ua.Editor
			} else {
				localOpSys, localEditor, _ := utils.ParseUserAgent(userAgent)
				opSys = condition.TernaryOperator(localOpSys != "", localOpSys, opSys)
				editor = condition.TernaryOperator(localEditor != "", localEditor, editor)
			}
		}
		if hb.Machine != "" {
			machineName = hb.Machine
		}

		hb = fillPlaceholders(hb, user, a.services.Heartbeat())

		hb.User = user
		hb.UserID = user.ID
		hb.Machine = machineName
		hb.OperatingSystem = opSys
		hb.Editor = editor
		hb.UserAgent = userAgent

		if !hb.Valid() || !hb.Timely(a.config.App.HeartbeatsMaxAge()) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("invalid heartbeat object"))
			return
		}

		hb.Hashed()
	}

	if err := a.services.Heartbeat().InsertBatch(heartbeats); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(conf.ErrInternalServerError))
		conf.Log().Request(r).Error("failed to batch-insert heartbeats", "error", err)
		return
	}

	if !user.HasData {
		user.HasData = true
		if _, err := a.services.Users().Update(user); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(conf.ErrInternalServerError))
			conf.Log().Request(r).Error("failed to update user", "userID", user.ID, "error", err)
			return
		}
	}

	go func() {
		_, err := a.services.UserAgentPlugin().CreateOrUpdate(userAgent, user.ID) // fire and forget
		if err != nil {
			conf.Log().Error("failed to create/update user agent plugin - %v", err.Error(), err)
		}
	}()

	defer func() {}()

	helpers.RespondJSON(w, r, http.StatusCreated, constructSuccessResponse(&heartbeats))
}

// construct wakatime response format https://wakatime.com/developers#heartbeats (well, not quite...)
func constructSuccessResponse(heartbeats *[]*models.Heartbeat) *v1.HeartbeatResponseViewModel {
	vm := &v1.HeartbeatResponseViewModel{
		Responses: make([][]interface{}, len(*heartbeats)),
	}

	for i := range *heartbeats {
		r := make([]interface{}, 2)
		r[0] = &v1.HeartbeatResponseData{
			Data:  nil, // see comment in struct declaration for details
			Error: nil,
		}
		r[1] = http.StatusCreated
		vm.Responses[i] = r
	}

	return vm
}

// inplace!
func fillPlaceholders(hb *models.Heartbeat, user *models.User, srv services.IHeartbeatService) *models.Heartbeat {
	// wakatime has a special keyword that indicates to use the most recent project for a given heartbeat
	// in chrome, the browser extension sends this keyword for (most?) heartbeats
	// presumably the idea behind this is that if you're coding, your browsing activity will likely also relate to that coding project
	// but i don't really like this, i'd rather have all browsing activity under the "unknown" project (as the case with firefox, for whatever reason)
	// see https://github.com/wakatime/browser-wakatime/pull/206
	if hb.Type == "url" || hb.Type == "domain" {
		hb.ClearPlaceholders() // ignore placeholders for data sent by browser plugin
	}

	if hb.IsPlaceholderProject() {
		// get project of latest heartbeat by user
		if latest, err := srv.GetLatestByUser(user); latest != nil && err == nil {
			hb.Project = latest.Project
		}
	}

	if hb.IsPlaceholderLanguage() {
		// get language of latest heartbeat by user and project
		if latest, err := srv.GetLatestByFilters(user, models.NewFiltersWith(models.SummaryProject, hb.Project)); latest != nil && err == nil {
			hb.Language = latest.Language
		}
	}

	if hb.IsPlaceholderBranch() {
		// get branch of latest heartbeat by user and project
		if latest, err := srv.GetLatestByFilters(user, models.NewFiltersWith(models.SummaryProject, hb.Project)); latest != nil && err == nil {
			hb.Branch = latest.Branch
		}
	}

	hb.ClearPlaceholders()
	return hb
}

// Only for Swagger

// @Summary Push a new heartbeat
// @ID post-heartbeat-2
// @Tags heartbeat
// @Accept json
// @Param heartbeat body models.Heartbeat true "A single heartbeat"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /v1/users/{user}/heartbeats [post]
func (a *APIv1) postAlias1() {}

// @Summary Push a new heartbeat
// @ID post-heartbeat-3
// @Tags heartbeat
// @Accept json
// @Param heartbeat body models.Heartbeat true "A single heartbeat"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /compat/wakatime/v1/users/{user}/heartbeats [post]
func (a *APIv1) postAlias2() {}

// @Summary Push a new heartbeat
// @ID post-heartbeat-4
// @Tags heartbeat
// @Accept json
// @Param heartbeat body models.Heartbeat true "A single heartbeat"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /users/{user}/heartbeats [post]
func (a *APIv1) postAlias3() {}

// @Summary Push new heartbeats
// @ID post-heartbeat-5
// @Tags heartbeat
// @Accept json
// @Param heartbeat body []models.Heartbeat true "Multiple heartbeats"
// @Security ApiKeyAuth
// @Success 201
// @Router /heartbeats [post]
func (a *APIv1) postAlias4() {}

// @Summary Push new heartbeats
// @ID post-heartbeat-6
// @Tags heartbeat
// @Accept json
// @Param heartbeat body []models.Heartbeat true "Multiple heartbeats"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /v1/users/{user}/heartbeats.bulk [post]
func (a *APIv1) postAlias5() {}

// @Summary Push new heartbeats
// @ID post-heartbeat-7
// @Tags heartbeat
// @Accept json
// @Param heartbeat body []models.Heartbeat true "Multiple heartbeats"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /compat/wakatime/v1/users/{user}/heartbeats.bulk [post]
func (a *APIv1) postAlias6() {}

// @Summary Push new heartbeats
// @ID post-heartbeat-8
// @Tags heartbeat
// @Accept json
// @Param heartbeat body []models.Heartbeat true "Multiple heartbeats"
// @Param user path string true "Username (or current)"
// @Security ApiKeyAuth
// @Success 201
// @Router /users/{user}/heartbeats.bulk [post]
func (a *APIv1) postAlias7() {}
