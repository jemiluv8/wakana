package api

import (
	"context"
	"log/slog"

	"github.com/riverqueue/river"
)

type LeaderboardArgs struct{}

func (LeaderboardArgs) Kind() string { return "leaderboard_generation" }

func (a *APIv1) leaderboardWorker(_ context.Context, _ *river.Job[LeaderboardArgs]) error {
	slog.Info("starting leaderboard generation worker")
	
	// Use the shared method that matches the CLI command logic
	err := a.services.LeaderBoard().GenerateWeeklyLeaderboards()
	if err != nil {
		slog.Error("failed to generate weekly leaderboards", "error", err)
		return err
	}
	
	slog.Info("successfully completed leaderboard generation worker")
	return nil
}