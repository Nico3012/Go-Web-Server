package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("./app")))

	fmt.Println("starting server...")
	http.ListenAndServeTLS(":5000", "/etc/letsencrypt/live/liquipay.de/fullchain.pem", "/etc/letsencrypt/live/liquipay.de/privkey.pem", nil)
}
