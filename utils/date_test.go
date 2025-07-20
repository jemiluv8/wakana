package utils

import (
	"github.com/duke-git/lancet/v2/datetime"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

var (
	tzLocal *time.Location
	tzUtc   *time.Location
	tzCet   *time.Location
	tzPst   *time.Location
)

func init() {
	tzLocal = time.Local
	tzUtc, _ = time.LoadLocation("UTC")
	tzCet, _ = time.LoadLocation("Europe/Berlin")
	tzPst, _ = time.LoadLocation("America/Los_Angeles")
}

func TestDate_SplitRangeByDays(t *testing.T) {
	df1, _ := time.Parse("2006-01-02 15:04:05", "2021-04-25 20:25:00")
	dt1, _ := time.Parse("2006-01-02 15:04:05", "2021-04-28 06:45:00")
	df2 := df1
	dt2 := datetime.EndOfDay(df1)
	df3 := df1
	dt3 := df1.Add(10 * time.Second)
	df4 := df1
	dt4 := df4

	result1 := SplitRangeByDays(df1, dt1)
	result2 := SplitRangeByDays(df2, dt2)
	result3 := SplitRangeByDays(df3, dt3)
	result4 := SplitRangeByDays(df4, dt4)

	assert.Len(t, result1, 4)
	assert.Equal(t, result1[0].Start, df1)
	assert.Equal(t, result1[3].End, dt1)
	assert.Equal(t, result1[1].Start.Hour()+result1[1].Start.Minute()+result1[1].Start.Second(), 0)
	assert.Equal(t, result1[2].Start.Hour()+result1[2].Start.Minute()+result1[2].Start.Second(), 0)
	assert.Equal(t, result1[3].Start.Hour()+result1[3].Start.Minute()+result1[3].Start.Second(), 0)
	assert.Equal(t, result1[1].Start, result1[0].End)
	assert.Equal(t, result1[2].Start, result1[1].End)
	assert.Equal(t, result1[3].Start, result1[2].End)

	assert.Len(t, result2, 1)
	assert.Equal(t, result2[0].Start, df2)
	assert.Equal(t, result2[0].End, dt2)

	assert.Len(t, result3, 1)
	assert.Equal(t, result3[0].Start, df3)
	assert.Equal(t, result3[0].End, dt3)

	assert.Len(t, result4, 0)
}
