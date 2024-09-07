# Install

Package is listed in package.json dependencies. Installation via npm.
Install without using package-lock.json because ~ is used to only allow patch updates. No major or minor updates

    npm install --no-save

# Update node version

Only make sure process.argv works the same as before.
Js language must be backwards compatible due to w3c.

# Update webpush

make sure setVapidDetails function works the same as before
make sure sendNotification function works the same as before
make sure generateVAPIDKeys function works the same as before
