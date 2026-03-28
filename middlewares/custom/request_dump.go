package relay

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httputil"
	"os"
	"sync"
)

type RequestDumpMiddleware struct {
	mu   sync.Mutex
	file *os.File
}

func NewRequestDumpMiddleware(path string) *RequestDumpMiddleware {
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err) // fine for dev/testing
	}

	return &RequestDumpMiddleware{
		file: f,
	}
}

func (m *RequestDumpMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// read + restore body
		body, _ := io.ReadAll(r.Body)
		r.Body.Close()
		r.Body = io.NopCloser(bytes.NewBuffer(body))

		// dump request (includes body)
		dump, err := httputil.DumpRequest(r, true)
		if err == nil {
			m.mu.Lock()
			m.file.Write(dump)
			m.file.Write([]byte("\n---\n")) // delimiter between requests
			m.mu.Unlock()
		}

		next.ServeHTTP(w, r)
	})
}
