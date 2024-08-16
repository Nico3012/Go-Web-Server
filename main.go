package main

import (
	"crypto/x509/pkix"
	"log"
	"net/http"

	"github.com/Nico3012/Go-Web-Server/webserver"
)

func main() {
	cert, err := webserver.CreateCertificateFromAuthority("tls/ca/trusted/ca.pem", "tls/ca/trusted/key.pem", pkix.Name{
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
	})
	if err != nil {
		log.Fatalf("Failed to create certificate from authority: %v", err)
	}

	// create handler and webserver:

	/*handler := http.NewServeMux()

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
	})*/

	err = webserver.ListenAndServeTLS(cert, http.FileServer(http.Dir("app")))
	log.Fatalf("Failed: %v", err)
}
