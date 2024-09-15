self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};

    if ("title" in data && "body" in data) event.waitUntil(
        self.registration.showNotification(data.title, {
            badge: "./img/logo_white_standalone_96.png", // 96x96
            icon: "./img/logo_blue_standalone_256.png", // unknown resolution
            body: data.body,
        })
    );
});

self.addEventListener("fetch", async (event) => {
    event.waitUntil(
        event.respondWith((async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                return new Response(`fetch failed with: ${error.message}`);
            }
        })()),
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
