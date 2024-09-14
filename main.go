package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/Nico3012/Go-Web-Server/push"
	"github.com/Nico3012/webserver"
)

type PushConfig struct {
	PublicKey     string
	PrivateKey    string
	Subscriptions []string
}

func main() {
	handler := http.NewServeMux()

	handler.HandleFunc("/public-key.txt", func(w http.ResponseWriter, r *http.Request) {
		var pushConfig PushConfig

		_, err := os.Stat("push.json")
		if errors.Is(err, os.ErrNotExist) {
			push.GeneratePushJson()
		}

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

		_, err = os.Stat("push.json")
		if errors.Is(err, os.ErrNotExist) {
			push.GeneratePushJson()
		}

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

		err = os.WriteFile("push.json", push, 0777)
		if err != nil {
			log.Fatalf("Failed to write push.json file: %v", err)
		}

		fmt.Fprintf(w, "")
	})

	handler.HandleFunc("/push", func(w http.ResponseWriter, r *http.Request) {
		push.Push("Test Titel", "Test Body")
		fmt.Fprintf(w, "Done!")
	})

	fs := http.FileServer(http.Dir("app"))

	handler.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")

		fs.ServeHTTP(w, r)
	})

	err := webserver.CreateWebServerAndCertificate(":443", "ca.pem", "key.pem", []string{
		"localhost",
		"127.0.0.1",
		"192.168.2.53",
		"192.168.2.79",             //
		"nico-laptop.speedport.ip", // Nico-Laptop @ any Speedport Router
		"nico-laptop.fritz.box",    // Nico-Laptop @ any FritzBox Router
		"192.168.2.225",            // Noah Speedport Router
	}, handler)

	log.Fatalf("Failed to create web server and certificate: %v", err)
}
