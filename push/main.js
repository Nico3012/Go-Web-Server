import webpush from "web-push";

const [title, body, publicKey, privateKey, subscription] = process.argv.slice(2);

webpush.setVapidDetails("mailto:example@example.com", publicKey, privateKey);

const result = await webpush.sendNotification(JSON.parse(subscription), JSON.stringify({
    title: title,
    body: body
}));

// return stdoutput to go as string
process.stdout.write(result.statusCode.toString())

// const { publicKey, privateKey } = webpush.generateVAPIDKeys();
// console.log(publicKey, privateKey);
