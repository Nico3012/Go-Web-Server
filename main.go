package main

import "net/http"

func main() {
	http.ListenAndServeTLS(":443", "tls/trusted/server_cert.pem", "tls/trusted/server_key.pem", nil)
}
