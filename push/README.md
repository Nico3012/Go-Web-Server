# Install

Package is listed in package.json dependencies. Installation via npm.<br>
Install without using package-lock.json because ~ is used to only allow patch updates. No major or minor updates<br>

    npm install --no-save

# Update node version

Only make sure process.argv works the same as before.<br>
Js language must be backwards compatible due to w3c.<br>

# Update webpush (in package.json dependencies)

make sure setVapidDetails function works the same as before<br>
make sure sendNotification function works the same as before<br>
make sure generateVAPIDKeys function works the same as before<br>
