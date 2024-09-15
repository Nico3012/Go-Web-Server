package push

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

type PushConfig struct {
	PublicKey     string
	PrivateKey    string
	Subscriptions []string
}

func GeneratePushJson() {
	cmd := exec.Command("node", "push/generate-vapid-keys.js")

	out, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	publicPrivateKey := strings.Split(string(out), "\n")

	pushConfig := PushConfig{
		PublicKey:     publicPrivateKey[0],
		PrivateKey:    publicPrivateKey[1],
		Subscriptions: []string{},
	}

	push, err := json.Marshal(pushConfig)
	if err != nil {
		log.Fatalf("Failed to marshal pushConfig to JSON: %v", err)
	}

	err = os.WriteFile("push.json", push, 0777)
	if err != nil {
		log.Fatalf("Failed to write push.json file: %v", err)
	}
}

func Push(title string, body string) {
	var pushConfig PushConfig

	_, err := os.Stat("push.json")
	if errors.Is(err, os.ErrNotExist) {
		GeneratePushJson()
	}

	push, err := os.ReadFile("push.json")
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
			"push/main.js",
			title,
			body,
			pushConfig.PublicKey,
			pushConfig.PrivateKey,
			subscription,
		)

		out, err := cmd.Output()
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println(string(out))
	}
}
