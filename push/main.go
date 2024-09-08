package main

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
)

type PushConfig struct {
	PublicKey     string
	PrivateKey    string
	Subscriptions []string
}

func main() {
	var pushConfig PushConfig

	push, err := os.ReadFile("../push.json")
	if err != nil {
		log.Fatalf("Failed to read push.json file: %v", err)
	}

	err = json.Unmarshal(push, &pushConfig)
	if err != nil {
		log.Fatalf("Failed to unmarshal content from push.json file: %v", err)
	}

	for i := range pushConfig.Subscriptions {
		subscription := pushConfig.Subscriptions[i]

		cmd := exec.Command(
			"node",
			"main.js",
			"Test Notification",
			"Test Data body",
			pushConfig.PublicKey,
			pushConfig.PrivateKey,
			subscription,
		)

		out, err := cmd.Output()
		if err != nil {
			log.Fatal(err)
		}

		log.Println(string(out))
	}
}
