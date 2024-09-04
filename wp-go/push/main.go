package main

import (
	"encoding/json"
	"log"

	"tst/webpush"
)

func main() {
	subs := `{"endpoint":"https://fcm.googleapis.com/fcm/send/dZYhS3HjwGc:APA91bH_8Sm94ZNjaP06HDEjVSQszHMJtWKAYePRbYYqh5zrcECzFmveJtjjhMTkjY_vRxHL7tAXuaXHt9xznr4MqFE6DsgcbqZ-K5pgPBHWtxdWZ8J2HHPeBJ7Xnjty2Vdku7F3ot8f","expirationTime":null,"keys":{"p256dh":"BF5D4vTK0trh6tnARkYXFkBgZRB7j0d6itIYyj4FxiTwLy-CTLdUkpFxfAp_MNVmglSp-JgFV9ffayyfsXSULnc","auth":"fxROnv9PrEFGl0JmIJ_0qA"}}`

	message := "tst"

	var sub webpush.Subscription

	err := json.Unmarshal([]byte(subs), &sub)
	if err != nil {
		log.Fatalf("Failed to parse JSON string: %v", err)
	}

	resp, err := webpush.SendNotification([]byte(message), &sub, &webpush.Options{
		TTL:             60,
		VAPIDPublicKey:  "BFSfu2z0zKhv7a2v3MkubqySWA6r4VrWvT8XoxTBcJTr82GzTwNv8HZcwCqFXoNnrhLbDkxA5bw63LEUSTZ2whU",
		VAPIDPrivateKey: "LPeRXr-5YZcVoWSwD3m7OYnE2tLplMz6tJcNl4-ARqI",
		Subscriber:      "example@example.com",
	})
	if err != nil {
		log.Println("Failed to send notification:", err)
	}

	log.Printf("resp notification: %v", resp)
}
