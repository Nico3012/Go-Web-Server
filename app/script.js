if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("./sw.js", {
        type: "module"
    });
} else {
    throw new Error("serviceWorker is not available on this browser");
}

/** @type {HTMLButtonElement | null} */
const subscribeButton = document.querySelector("button#subscribe");
if (subscribeButton === null) throw new Error("cannot find button#subscribe");

subscribeButton.addEventListener("click", async () => {
    try {
        const sw = await navigator.serviceWorker.ready;

        const oldSubscription = await sw.pushManager.getSubscription();

        if (oldSubscription !== null) {
            const unsubscribeStatus = await oldSubscription.unsubscribe();

            if (unsubscribeStatus === false) throw new Error("failed to unsubscribe");
        }

        const publicKeyResponse = await fetch("/public-key.txt");

        const publicKey = await publicKeyResponse.text();

        const subscription = await sw.pushManager.subscribe({
            applicationServerKey: publicKey,
            userVisibleOnly: true
        });

        const subscribeResponse = await fetch("/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription)
        });

        if (!subscribeResponse.ok) throw new Error("subscribeResponse was not ok!");
        else alert("done!");

        /*const subscriptionResponse = await fetch("/subscribe.json", {
            body: JSON.stringify(subscription),
            method: "POST"
        });

        const subscriptionStatus = await subscriptionResponse.json();

        alert(JSON.stringify(subscriptionStatus));*/
    } catch (error) {
        alert(error?.message);
    }
});
