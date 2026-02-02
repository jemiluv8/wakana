package utils

import (
	"time"
)

// getLastCompletedWeek returns the Monday ("from") and Sunday ("to")
// of the most recent fully completed week.
func GetLastCompletedWeek(now time.Time) (time.Time, time.Time) {
	// Ensure we're only working with the date (midnight, no time component)
	year, month, day := now.Date()
	currentDate := time.Date(year, month, day, 0, 0, 0, 0, now.Location())

	weekday := int(currentDate.Weekday()) // Sunday=0, Monday=1, ... Saturday=6

	var daysSinceMonday int
	if weekday == 0 {
		// Sunday
		daysSinceMonday = 6
	} else {
		daysSinceMonday = weekday - 1
	}

	// Calculate the Monday of the current week
	currentWeekMonday := currentDate.AddDate(0, 0, -daysSinceMonday)
	
	// The last completed week is the week before
	from := currentWeekMonday.AddDate(0, 0, -7)
	to := from.AddDate(0, 0, 7)

	return from, to
}
