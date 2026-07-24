package middlewares

import (
	"bytes"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"sync"
)

type PayloadDumper struct {
	file string
	mu   sync.Mutex
}

// logDir: directory where your normal log files live
// fileName: e.g. "payloads.ndjson"
func NewPayloadDumper(logDir, fileName string) *PayloadDumper {
	rootDir, _ := os.Getwd()
	logDir = rootDir + "/log"
	return &PayloadDumper{
		file: filepath.Join(logDir, fileName),
	}
}

// Middleware turns PayloadDumper into a standard http middleware function.
func (d *PayloadDumper) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("processing >>1")
		if r.Body != nil {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				slog.Error("payload dumper: failed to read request body", "error", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			// Restore the body so downstream handlers can still read it.
			r.Body = io.NopCloser(bytes.NewReader(body))

			if len(body) > 0 {
				d.writePayload(body)
			}
		}

		// Proceed to the real request handler
		next.ServeHTTP(w, r)
	})
}

func (d *PayloadDumper) writePayload(body []byte) {
	d.mu.Lock()
	defer d.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(d.file), 0755); err != nil {
		slog.Error("payload dumper: failed to create directory", "error", err)
		return
	}

	f, err := os.OpenFile(d.file, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		slog.Error("payload dumper: failed to open file", "error", err)
		return
	}
	defer f.Close()

	if _, err := f.Write(body); err != nil {
		slog.Error("payload dumper: failed to write payload", "error", err)
		return
	}

	if _, err := f.Write([]byte("\n")); err != nil {
		slog.Error("payload dumper: failed to write newline", "error", err)
	}
}
