package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	handler := http.NewServeMux()

	/*handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hi")
	})*/

	handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			url := r.URL.String()
			file, err := os.ReadFile("app" + url)
			if err != nil {
				fmt.Fprintf(w, "Failed to read file!")
			}
			w.Header().Add("Content-Type", "text/html; charset=utf-8") // first write headers
			w.WriteHeader(200)                                         // send headers with status
			fmt.Fprint(w, string(file))                                // last send content
		} else {
			fmt.Fprintf(w, "This server only supports GET method! You sent a %s request.", r.Method)
		}
		//w.Header().Add("Content-Type", "text/html; charset=utf-8")
		//w.WriteHeader(400)
		//fmt.Fprintf(w, "<h1>Hallo Welt!!!</h1>")
	})

	server := &http.Server{
		Addr:    ":4433", // listen on any address
		Handler: handler,
	}

	err := server.ListenAndServeTLS("tls/cert/live/cert.pem", "tls/cert/live/key.pem")
	if err != nil {
		log.Fatalf("Failed to listen and server tls: %v", err)
	}
}
