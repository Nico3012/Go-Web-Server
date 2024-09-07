package main

import (
	"log"
	"os/exec"
)

func main() {
	cmd := exec.Command(
		"node",
		"main.js",
		"Test Notification",
		"Test Data body",
		"BFSfu2z0zKhv7a2v3MkubqySWA6r4VrWvT8XoxTBcJTr82GzTwNv8HZcwCqFXoNnrhLbDkxA5bw63LEUSTZ2whU",
		"LPeRXr-5YZcVoWSwD3m7OYnE2tLplMz6tJcNl4-ARqI",
		`{"endpoint":"https://fcm.googleapis.com/fcm/send/dZYhS3HjwGc:APA91bH_8Sm94ZNjaP06HDEjVSQszHMJtWKAYePRbYYqh5zrcECzFmveJtjjhMTkjY_vRxHL7tAXuaXHt9xznr4MqFE6DsgcbqZ-K5pgPBHWtxdWZ8J2HHPeBJ7Xnjty2Vdku7F3ot8f","expirationTime":null,"keys":{"p256dh":"BF5D4vTK0trh6tnARkYXFkBgZRB7j0d6itIYyj4FxiTwLy-CTLdUkpFxfAp_MNVmglSp-JgFV9ffayyfsXSULnc","auth":"fxROnv9PrEFGl0JmIJ_0qA"}}`,
	)

	out, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	log.Println(string(out))
}
