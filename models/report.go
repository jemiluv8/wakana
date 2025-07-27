package models

import "time"

type Report struct {
	From           time.Time
	To             time.Time
	User           *User
	Summary        *Summary
	DailySummaries []*Summary
}

func (r *Report) DailyAverage() time.Duration {
	numberOfDays := len(r.DailySummaries)
	if numberOfDays == 0 {
		return 0
	}
	dailyAverage := r.Summary.TotalTime() / time.Duration(numberOfDays)
	return dailyAverage
}

// DailyPercentage calculates the percentage of a daily summary relative to the max daily total
func (r *Report) DailyPercentage(summary *Summary) int {
	if len(r.DailySummaries) == 0 || summary == nil {
		return 0
	}

	maxTime := Summaries(r.DailySummaries).MaxTotalTime()
	if maxTime == 0 {
		return 0
	}

	percentage := int((summary.TotalTime() * 100) / maxTime)
	if percentage < 5 {
		return 5 // Minimum 5% to ensure visibility
	}
	if percentage > 100 {
		return 100
	}
	return percentage
}
