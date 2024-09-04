self.addEventListener("push", (event) => {
    event.waitUntil(
        self.registration.showNotification("Hallo Welt!", {
            badge: "./img/notification-badge.1.0.0.png", // 96x96
            icon: "./img/notification-icon.1.0.0.png", // unknown resolution
            body: "This is the notification body :)"
        })
    );
});
