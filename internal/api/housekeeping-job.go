package api

import (
	"context"
	"time"

	"github.com/riverqueue/river"
)

type HousekeepingDataCleanupArgs struct{}
type HousekeepingInactiveUsersArgs struct{}

func (HousekeepingDataCleanupArgs) Kind() string { return "housekeeping_data_cleanup" }
func (HousekeepingInactiveUsersArgs) Kind() string { return "housekeeping_inactive_users" }

func (a *APIv1) housekeepingDataCleanupWorker(_ context.Context, _ *river.Job[HousekeepingDataCleanupArgs]) error {
	// Fetch all users and clean old data for non-subscribed users
	users, err := a.services.Users().GetAll()
	if err != nil {
		return err
	}

	for _, u := range users {
		// Skip users with unlimited data access (subscribed users)
		if u.MinDataAge().IsZero() {
			continue
		}
		
		// Clean user data older than their minimum data age
		if err := a.services.HouseKeeping().CleanUserDataBefore(u, u.MinDataAge()); err != nil {
			// Log error but continue with other users
			continue
		}
	}
	
	return nil
}

func (a *APIv1) housekeepingInactiveUsersWorker(_ context.Context, _ *river.Job[HousekeepingInactiveUsersArgs]) error {
	if a.config.App.MaxInactiveMonths <= 0 {
		return nil // Skip if not configured
	}
	
	// Calculate cutoff date for inactive users
	cutoffDate := time.Now().AddDate(0, -a.config.App.MaxInactiveMonths, 0)
	return a.services.HouseKeeping().CleanInactiveUsers(cutoffDate)
}