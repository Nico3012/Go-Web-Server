package main

import (
	"crypto/x509/pkix"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/Nico3012/Go-Web-Server/webserver"
)

// func getContentType(filename string) string {
// 	if strings.HasSuffix(filename, ".txt") {
// 		return "text/plain; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".html") {
// 		return "text/html; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".css") {
// 		return "text/css; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".js") {
// 		return "text/javascript; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".json") {
// 		return "application/json; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".webmanifest") {
// 		return "application/manifest+json; charset=utf-8"
// 	}
// 	if strings.HasSuffix(filename, ".wasm") {
// 		return "application/wasm"
// 	}
// 	if strings.HasSuffix(filename, ".png") {
// 		return "image/png"
// 	}
// 	return "application/octet-stream"
// }

type PushConfig struct {
	PublicKey     string
	PrivateKey    string
	Subscriptions []string
}

func main() {
	handler := http.NewServeMux()

	handler.HandleFunc("/public-key.txt", func(w http.ResponseWriter, r *http.Request) {
		var pushConfig PushConfig

		push, err := os.ReadFile("push.json")
		if err != nil {
			log.Fatalf("Failed to read push.json file: %v", err)
		}

		err = json.Unmarshal(push, &pushConfig)
		if err != nil {
			log.Fatalf("Failed to unmarshal content from push.json file: %v", err)
		}

		fmt.Fprintf(w, pushConfig.PublicKey)
	})

	handler.HandleFunc("/subscribe", func(w http.ResponseWriter, r *http.Request) {
		subscription, err := io.ReadAll(r.Body)
		if err != nil {
			log.Fatalf("Failed to read body un /subscribe route: %v", err)
		}

		var pushConfig PushConfig

		push, err := os.ReadFile("push.json")
		if err != nil {
			log.Fatalf("Failed to read push.json file: %v", err)
		}

		err = json.Unmarshal(push, &pushConfig)
		if err != nil {
			log.Fatalf("Failed to unmarshal content from push.json file: %v", err)
		}

		pushConfig.Subscriptions = append(pushConfig.Subscriptions, string(subscription))

		push, err = json.Marshal(pushConfig)
		if err != nil {
			log.Fatalf("Failed to marshal pushConfig to JSON: %v", err)
		}

		err = os.WriteFile("push.json", push, fs.FileMode(os.O_WRONLY))
		if err != nil {
			log.Fatalf("Failed to write push.json file: %v", err)
		}

		fmt.Fprintf(w, "")
	})

	handler.Handle("/", http.FileServer(http.Dir("app")))

	// handler := http.NewServeMux()

	// handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	if r.Method == "GET" {
	// 		html, err := os.ReadFile("app" + r.URL.String())
	// 		if err != nil {
	// 			return
	// 		}

	// 		w.Header().Set("Content-Type", getContentType(r.URL.String()))
	// 		w.WriteHeader(200)
	// 		w.Write(html)
	// 	} else {
	// 		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	// 		// "Content-Length" and "Date" header will be added automatically
	// 		w.WriteHeader(500)
	// 		w.Write([]byte("Only GET requests are supported"))
	// 	}
	// })

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
