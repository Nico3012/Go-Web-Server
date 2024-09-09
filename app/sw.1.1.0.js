self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};

    if ("title" in data && "body" in data) event.waitUntil(
        self.registration.showNotification(data.title, {
            badge: "./img/notification-badge.1.0.0.png", // 96x96
            icon: "./img/notification-icon.1.0.0.png", // unknown resolution
            body: data.body,
        })
    );
});

// not compatible with IOS:
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // mdn code:
    event.waitUntil(
        clients
            .matchAll({
                type: "window",
            })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === "/" && "focus" in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow("/");
            }),
    );
});
