package main

import (
	"log"
	"net/http"
)

var (
	// cert = "/etc/letsencrypt/live/liquipay.de/fullchain.pem"
	// key  = "/etc/letsencrypt/live/liquipay.de/privkey.pem"
	cert = "tls/trust/cert.pem"
	key  = "tls/trust/key.pem"
)

func main() {
	fileServer := http.FileServer(http.Dir("./app"))
	http.Handle("/", fileServer)

	err := http.ListenAndServeTLS(":443", cert, key, nil)

	if err != nil {
		log.Fatal(err)
	}
}
