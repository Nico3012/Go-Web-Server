package main

import (
	"crypto/x509/pkix"
	"log"
	"net/http"

	"github.com/Nico3012/Go-Web-Server/webserver"
)

func main() {
	handler := http.FileServer(http.Dir("app"))

	err := webserver.CreateWebServerAndCertificate(":443", "tls/ca/trusted/ca.pem", "tls/ca/trusted/key.pem", pkix.Name{
		// if this information is missing, the certificate may not be trusted:
		CommonName:         "liquipay.de",                                // required by openssl
		Organization:       []string{"Liquipay UG (haftungsbeschränkt)"}, // required by openssl
		OrganizationalUnit: []string{"IT"},                               // required by openssl
		Country:            []string{"DE"},                               // required by openssl
		Province:           []string{"Nordrhein-Westfalen"},              // required by openssl
		Locality:           []string{"Lindlar"},                          // required by openssl
		PostalCode:         []string{"51789"},                            // optional
		StreetAddress:      []string{"Hauptstraße 10"},                   // optional
	}, []string{
		"localhost",
		"127.0.0.1",
		"192.168.2.53",
		"192.168.2.79",
	}, handler)

	log.Fatalf("Failed to create web server and certificate: %v", err)
}
