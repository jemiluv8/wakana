package models

import (
	"encoding/json"
	"testing"
	"time"
)

func TestDurationMarshalJSON(t *testing.T) {
	now := time.Now()
	d := &Duration{
		UserID:       "test-user",
		Time:         CustomTime(now),
		Duration:     time.Hour,
		Project:      "test-project",
		DurationSecs: 3600,
	}

	data, err := json.Marshal(d)
	if err != nil {
		t.Fatalf("Failed to marshal Duration: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("Failed to unmarshal result: %v", err)
	}

	// Check that time is a Unix timestamp (number)
	timeVal, ok := result["time"].(float64)
	if !ok {
		t.Errorf("Expected time to be a float64 (Unix timestamp), got %T: %v", result["time"], result["time"])
	}

	expectedTime := float64(now.Unix())
	if timeVal != expectedTime {
		t.Errorf("Expected time to be %f, got %f", expectedTime, timeVal)
	}

	// Check that other fields are present
	if result["project"] != "test-project" {
		t.Errorf("Expected project to be 'test-project', got %v", result["project"])
	}

	if result["duration"] != 3600.0 {
		t.Errorf("Expected duration to be 3600, got %v", result["duration"])
	}
}