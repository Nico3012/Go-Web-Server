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
		fmt.Fprintf(w, "<h1>Hallo Welt!!!</h1>")
	})

	server := &http.Server{
		Addr:    ":4433", // listen on any address
		Handler: handler,
	}

	server.ListenAndServeTLS("tls/cert-rsa/trusted/cert.pem", "tls/cert-rsa/trusted/priv.pem")
}
