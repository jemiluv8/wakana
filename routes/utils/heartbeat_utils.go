package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/muety/wakapi/models"
)

func ParseHeartbeats(r *http.Request) ([]*models.Heartbeat, error) {
	heartbeats, err := tryParseBulk(r)
	if err == nil {
		return heartbeats, err
	}

	heartbeats, err = tryParseSingle(r)
	if err == nil {
		return heartbeats, err
	}

	return []*models.Heartbeat{}, err
}

func tryParseBulk(r *http.Request) ([]*models.Heartbeat, error) {
	var heartbeats []*models.Heartbeat

	body, _ := io.ReadAll(r.Body)
	r.Body.Close()
	r.Body = io.NopCloser(bytes.NewBuffer(body))

	dec := json.NewDecoder(io.NopCloser(bytes.NewBuffer(body)))
	if err := dec.Decode(&heartbeats); err != nil {
		return nil, err
	}

	// Set category to "ai coding" if it's empty/null
	// for _, hb := range heartbeats {
	// 	if hb != nil && hb.Category == "" {
	// 		hb.Category = "ai coding"
	// 	}
	// }

	return heartbeats, nil
}

func tryParseSingle(r *http.Request) ([]*models.Heartbeat, error) {
	var heartbeat models.Heartbeat

	body, _ := io.ReadAll(r.Body)
	r.Body.Close()
	r.Body = io.NopCloser(bytes.NewBuffer(body))

	dec := json.NewDecoder(io.NopCloser(bytes.NewBuffer(body)))
	if err := dec.Decode(&heartbeat); err != nil {
		return nil, err
	}

	// Set category to "ai coding" if it's empty/null
	// if heartbeat.Category == "" {
	// 	heartbeat.Category = "ai coding"
	// }

	return []*models.Heartbeat{&heartbeat}, nil
}
