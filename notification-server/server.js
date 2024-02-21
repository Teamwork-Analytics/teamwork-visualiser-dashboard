const express = require("express");
const admin = require("firebase-admin");

// Create instance of Express
const app = express();
const port = 4222; // random port number

app.use(express.json()); // Middleware to parse JSON bodies

// Initialize Firebase Admin with your service account
const serviceAccount = require("./teamwork-analysis-secret/teamwork-analysis-firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Handle post request for `/send-notification`
app.post("/send-notification", (req, res) => {
  console.log("Received request:", req.body);
  const message = {
    notification: {
      title: "Control room",
      body: req.body.message,
    },
    android: {
      priority: "high",
    },
    token:
      "fMVd4gzlQBOrXwpUSZuQdk:APA91bEM141-Ne0PY7-FiRDrnrUScnAvkVQQCiuY1urDXySySeZ5plGSANpxiwlDfXvOC5baa7g83Uf0GcQvQaQI8C_aazg3dk9_5dac5ghkUB9V3-x7mBvrWwxFj9tDjsfJLU2GgC42", // TODO: get token from DB
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string
      console.log("Successfully sent message:", response);
      res.json({ success: true, message: "Notification sent", response });
    })
    .catch((error) => {
      console.log("Error sending message:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error,
      });
    });
});

// Start the server and listen on port
app.listen(port, () => {
  console.log("Server is running on http://localhost:${port}`");
});
