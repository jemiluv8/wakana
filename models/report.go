package models

import "time"

type Report struct {
	From           time.Time
	To             time.Time
	User           *User
	Summary        *Summary
	DailySummaries []*Summary
	// WeeklyTotal is computed using day-by-day DurationService calculation,
	// matching the leaderboard computation. This excludes "Unknown" language (browser time).
	WeeklyTotal time.Duration
}

func (r *Report) DailyAverage() time.Duration {
	numberOfDays := len(r.DailySummaries)
	if numberOfDays == 0 {
		return 0
	}
	dailyAverage := r.WeeklyTotal / time.Duration(numberOfDays)
	return dailyAverage
}

// DailyPercentage calculates the percentage of a daily summary relative to the max daily total
func (r *Report) DailyPercentage(summary *Summary) int {
	if len(r.DailySummaries) == 0 || summary == nil {
		return 0
	}

	maxTime := Summaries(r.DailySummaries).MaxTotalTime()
	if maxTime == 0 {
		// If no time tracked, still show minimal bar
		return 5
	}

	summaryTime := summary.TotalTime()
	if summaryTime == 0 {
		// Show minimal bar even for days with no activity
		return 5
	}

	percentage := int((summaryTime * 100) / maxTime)
	if percentage < 5 {
		return 5 // Minimum 5% to ensure visibility
	}
	if percentage > 100 {
		return 100
	}
	return percentage
}
