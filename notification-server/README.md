# Notification Server

A NodeJS server that trigger Firebase Cloud Messaging service and send notification to devices registered.

> [!WARNING]  
> The firebase admin key was pushed on this repo. Google found out and depreciated the key. Please generate a new key to use the notification feature.

## Overview

This server open port `4222` to receive API call. Once it received a POST request at `send-notification` it uses [FCM Admin SDK](https://firebase.google.com/docs/reference/admin/node) to send notification to devices in the list.

## How to run

1. Navigate to this directory using `cd notification server` from root of the project.
2. Do `node server.js` to run this server. (`npm install` might be required to install dependencies).
3. [Reminder] While installing android application (android-fitbit-middleman), please enable notification to ensure this server is working properly.

## Work in progress - Registering devices

As of Feb 2024, manual registering devices is needed during setup. The device token can be find in the terminal logging of Android app, and has to be put in the list of `tokens` in `server.js` (search `tokens` to find the list).

The developer is working on the automation of this procedure, once it is done, please remove this section in `README.md`.

## Firebase Cloud Messaging Service

A json file of Firebase service account is required for the service. Currently the json file should be located at `teamwork-analysis-secret/teamwork-analysis-firebase-admin-key.json`. In case the developer account has changed, and there is no way to retrieve the old service account, see section `How to switch FCM account` below.

## How to trigger notification (API)

To trigger (send) the notification to the devices, send a POST request from the app or using tools like curl command. Example of curl command (send this from pc terminal):

```
curl -X POST http://localhost:4222/send-notification \
-H "Content-Type: application/json" \
-d '{"title": "The title", "message": "Replace with your actual message."}'
```

## How to switch FCM account (in case losing accessed to pervious dev account)

Switching the Firebase Cloud Messaging (FCM) account used by your Node.js server to send notifications involves a few steps, primarily focused on obtaining and configuring a new service account JSON file from the Firebase console for the new account. Here's a step-by-step guide:

### 1. Create or Select Your New Firebase Project

- **If you already have a Firebase project** in your new Google account, you can use it. Otherwise, you need to create a new Firebase project:
  - Go to the [Firebase Console](https://console.firebase.google.com/).
  - Click on "Add project" and follow the instructions.

### 2. Generate a New Service Account Key

- In the Firebase console, select your project.
- Click on the gear icon next to "Project Overview" and select "Project settings".
- Go to the "Service accounts" tab.
- You'll see a Firebase Admin SDK section. Here, click on "Generate new private key".
- A JSON file will be downloaded. This is your new service account key.

### 3. Update Your Node.js Server with the New Service Account Key

- Replace the old service account JSON file on your Node.js server with the new one you just downloaded.
- Ensure your application code is pointing to the new JSON file. If you're using the Firebase Admin SDK, this often involves initializing the SDK with the path to the new file:

```javascript
const admin = require("firebase-admin");

const serviceAccount = require("path/to/new/service-account-file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

### 4. Test the Configuration

- After updating the service account information, test sending a notification from your Node.js server to ensure everything is configured correctly. You can do this by triggering a notification in your server's usual manner, whether through an API endpoint, a script, or any other method you've set up.

### 5. Update Firebase Project Settings (if necessary)

- If your Android app is also tied to the Firebase project (for example, using Firebase Analytics, Firestore, etc.), ensure you've updated the app with any new project configuration details. This may involve downloading and replacing the `google-services.json` in your Android app with the one from the new Firebase project.

### Additional Considerations

- **Security**: Keep your new service account JSON file secure and do not expose it in public repositories or locations.
- **Environment Variables**: Consider using environment variables to store the path or contents of your service account JSON to make future changes easier and your app more secure.
- **FCM Sender ID**: If your Android app uses the FCM Sender ID, make sure it matches the one from the new Firebase project. This ID is used in the client app to establish which FCM project it belongs to.

By following these steps, you should be able to smoothly transition your Node.js server to use a new Firebase project for sending FCM notifications to your Android app.
