package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/duke-git/lancet/v2/maputil"
	"github.com/duke-git/lancet/v2/slice"
	"github.com/go-chi/chi/v5"
	"github.com/muety/wakapi/middlewares"
	"github.com/muety/wakapi/models"
	v1 "github.com/muety/wakapi/models/compat/shields/v1"
	routeutils "github.com/muety/wakapi/routes/utils"
	"github.com/muety/wakapi/utils"
	"github.com/narqo/go-badge"
)

// type BadgeHandler struct {
// 	config      *conf.Config
// 	cache       *cache.Cache
// 	userSrvc    services.IUserService
// 	summarySrvc services.ISummaryService
// }

// func NewBadgeHandler(services services.IServices) *BadgeHandler {
// 	return &BadgeHandler{
// 		config:      conf.Get(),
// 		cache:       cache.New(time.Hour, time.Hour),
// 		userSrvc:    services.Users(),
// 		summarySrvc: services.Summary(),
// 	}
// }

// func (h *BadgeHandler) RegisterRoutes(router chi.Router) {
// 	r := chi.NewRouter()
// 	r.Use(middlewares.NewAuthenticateMiddleware(h.userSrvc).WithOptionalFor("/api/badge/").Handler)
// 	r.Get("/{user}/*", h.Get)
// 	router.Mount("/badge", r)
// }

func (a *APIv1) GetBadge(w http.ResponseWriter, r *http.Request) {
	authorizedUser := middlewares.GetPrincipal(r)
	user, err := a.services.Users().GetUserById(chi.URLParam(r, "user"))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	interval, filters, err := routeutils.GetBadgeParams(r.URL.Path, authorizedUser, user)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte(err.Error()))
		return
	}
	filters.WithSelectFilteredOnly()

	cacheKey := fmt.Sprintf("%s_%v_%s_%s", user.ID, *interval.Key, filters.Hash(), r.URL.RawQuery)
	noCache := utils.IsNoCache(r, 1*time.Hour)
	if cacheResult, ok := a.cache.Get(cacheKey); ok && !noCache {
		respondSvg(w, cacheResult.([]byte))
		return
	}

	params := &models.SummaryParams{
		From:    interval.Start,
		To:      interval.End,
		User:    user,
		Filters: filters,
	}

	summary, err, status := routeutils.LoadUserSummaryByParams(a.services.Summary(), params)
	if err != nil {
		w.WriteHeader(status)
		w.Write([]byte(err.Error()))
		return
	}

	badgeData := v1.NewBadgeDataFrom(summary)
	if customLabel := r.URL.Query().Get("label"); customLabel != "" {
		badgeData.Label = customLabel
	}
	if customColor := r.URL.Query().Get("color"); customColor != "" {
		badgeData.Color = customColor
	}

	if badgeData.Color[0:1] != "#" && !slice.Contain(maputil.Keys(badge.ColorScheme), badgeData.Color) {
		badgeData.Color = "#" + badgeData.Color
	}

	badgeSvg, err := badge.RenderBytes(badgeData.Label, badgeData.Message, badge.Color(badgeData.Color))
	a.cache.SetDefault(cacheKey, badgeSvg)
	respondSvg(w, badgeSvg)
}

func respondSvg(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "image/svg+xml")
	w.Header().Set("Cache-Control", "max-age=3600")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
