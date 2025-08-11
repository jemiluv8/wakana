package models

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestCustomTimeMarshalJSON(t *testing.T) {
	now := time.Now()
	ct := CustomTime(now)
	
	// Debug: check the value
	t.Logf("Original time: %v", now)
	t.Logf("CustomTime value: %v", time.Time(ct))

	data, err := json.Marshal(&ct)
	if err != nil {
		t.Fatalf("Failed to marshal CustomTime: %v", err)
	}

	// Should be an ISO 8601 string (RFC3339)
	str := string(data)
	t.Logf("Marshaled CustomTime: %s", str)
	// Remove quotes
	str = strings.Trim(str, "\"")

	// Try to parse it back as RFC3339
	parsed, err := time.Parse(time.RFC3339, str)
	if err != nil {
		t.Errorf("Expected CustomTime to marshal as RFC3339, got %s: %v", str, err)
	}

	// Check that the times are equivalent (within a second due to rounding)
	if parsed.Unix() != now.Unix() {
		t.Errorf("Parsed time %v doesn't match original time %v", parsed, now)
	}
}

func TestInvoiceCustomTimeFormat(t *testing.T) {
	now := time.Now()
	invoice := &Invoice{
		ID:        "test-id",
		CreatedAt: CustomTime(now),
		UpdatedAt: CustomTime(now),
	}

	data, err := json.Marshal(invoice)
	if err != nil {
		t.Fatalf("Failed to marshal Invoice: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("Failed to unmarshal result: %v", err)
	}

	// Check that created_at and updated_at are ISO 8601 strings
	createdAt, ok := result["created_at"].(string)
	if !ok {
		t.Errorf("Expected created_at to be a string, got %T: %v", result["created_at"], result["created_at"])
	}

	// Try to parse as RFC3339
	if _, err := time.Parse(time.RFC3339, createdAt); err != nil {
		t.Errorf("Expected created_at to be RFC3339 format, got %s: %v", createdAt, err)
	}
}