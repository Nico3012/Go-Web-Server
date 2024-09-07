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
		`{"endpoint":"https://fcm.googleapis.com/fcm/send/ehATGXSIFuE:APA91bGL5GtVrgsY5NMAyKQ6yAnRHbWCxBTP6Z6MSSQT0do2L22h_4Gd0Khw0n4zL_mRwCn170Ep5RmeXu-hL9OVUNYmOCviPRqJdW91PU71N4A9oObmZGiUmkWtpgLf9PTaFR0reeQt","expirationTime":null,"keys":{"p256dh":"BDQFQMWnI9ClKvlPcgnGTs1IaB8KH-mJHrmuiow6MLO_FBdoe-7miE-dfgUEq16doqTH-nlLVe3B-rhD8mfJgRk","auth":"2V1MlfQU_dJxmbIpMIrAEw"}}`,
	)

	out, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	log.Println(string(out))
}
