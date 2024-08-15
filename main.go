package main

import (
	"fmt"
	"net/http"
)

func main() {
	handler := http.NewServeMux()

	/*handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hi")
	})*/

	handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(400)
		fmt.Fprintf(w, "<h1>Hallo Welt!</h1>")
	})

	server := &http.Server{
		Addr:    ":4433",
		Handler: handler,
	}

	server.ListenAndServeTLS("tls/cert/trusted/cert.pem", "tls/cert/trusted/priv.pem")
}
