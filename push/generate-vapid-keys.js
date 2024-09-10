import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
process.stdout.write(`${publicKey}\n${privateKey}\n`);
