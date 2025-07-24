package api

import (
	"context"

	"github.com/muety/wakapi/models"
	"github.com/riverqueue/river"
)

type LeaderboardArgs struct{}

func (LeaderboardArgs) Kind() string { return "leaderboard_generation" }

func (a *APIv1) leaderboardWorker(_ context.Context, _ *river.Job[LeaderboardArgs]) error {
	// Get all users with leaderboard enabled
	users, err := a.services.Users().GetAllByLeaderboard(true)
	if err != nil {
		return err
	}
	
	// Generate leaderboard with default scope and language summaries
	return a.services.LeaderBoard().ComputeLeaderboard(users, a.services.LeaderBoard().GetDefaultScope(), []uint8{models.SummaryLanguage})
}