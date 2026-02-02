package utils

import (
	"testing"
	"time"
)

func mustDate(dateStr string) time.Time {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		panic(err)
	}
	return t
}

func TestGetLastCompletedWeek(t *testing.T) {
	tests := []struct {
		name     string
		now      time.Time
		wantFrom string
		wantTo   string
	}{
		{
			name:     "Monday morning",
			now:      mustDate("2025-08-11"), // Monday
			wantFrom: "2025-08-04",
			wantTo:   "2025-08-11",
		},
		{
			name:     "Saturday",
			now:      mustDate("2025-08-09"), // Saturday
			wantFrom: "2025-07-28",
			wantTo:   "2025-08-04",
		},
		{
			name:     "Wednesday",
			now:      mustDate("2025-08-06"), // Wednesday
			wantFrom: "2025-07-28",
			wantTo:   "2025-08-04",
		},
		{
			name:     "Sunday",
			now:      mustDate("2025-08-10"), // Sunday
			wantFrom: "2025-07-28",
			wantTo:   "2025-08-04",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			from, to := GetLastCompletedWeek(tt.now)
			gotFrom := from.Format("2006-01-02")
			gotTo := to.Format("2006-01-02")
			if gotFrom != tt.wantFrom || gotTo != tt.wantTo {
				t.Errorf("got from=%s, to=%s; want from=%s, to=%s", gotFrom, gotTo, tt.wantFrom, tt.wantTo)
			}
		})
	}
}
