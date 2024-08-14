package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/hi", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hi")
	})

	log.Fatal(http.ListenAndServeTLS(":4433", "tls/__copilot-backup__/cert.pem", "tls/__copilot-backup__/key.pem", nil))
}
