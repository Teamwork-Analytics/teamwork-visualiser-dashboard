const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Create instance of Express
const app = express();  
const port = 4222; // random port number

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON bodies

// Initialize Firebase Admin with your service account
const serviceAccount = require("./teamwork-analysis-secret/teamwork-analysis-firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Handle post request for `/send-notification`
app.post("/send-notification", async (req, res) => {
  console.log("Received request:", req.body);

  // device tokens
  // TODO: directly fetch token from DB
  const tokens = [
    // "fMVd4gzlQBOrXwpUSZuQdk:APA91bEM141-Ne0PY7-FiRDrnrUScnAvkVQQCiuY1urDXySySeZ5plGSANpxiwlDfXvOC5baa7g83Uf0GcQvQaQI8C_aazg3dk9_5dac5ghkUB9V3-x7mBvrWwxFj9tDjsfJLU2GgC42",
    "cRKzCHVNSWq04bcMWQv4tE:APA91bHuAkpOsMGomaAqUKPaLppBp96-6RfcBp2lovkbcj8VNNMm-k_mhekCkHe_rAef7-Ets6JPgWSan__2G4z3axq1baHCRWW4N_m_1HkiOnV7FX-0e1TlnKOhru5qM9e_Hsb95cdQ",
    "fqQWVtTfTV20XaZTWu0mYq:APA91bFfiVh0WIJJz3yB44J8P-ye6D2dnOfGVJq-pv9KDf_sybtFCfCND47chpE5KsmNugT6EXK65sJhI_k_esXoGG-3ipzBASKBDkr7_CuLCsqbV21Tr86dzqY_EYxXjn012yepg8Yt",
  ];

  let successes = 0;
  let failures = 0;

  const title = req.body.title || "Control room"; // Use provided title or default to "Control room"
  const messageContent = req.body.message;

  for (const token of tokens) {
    const message = {
      notification: {
        title: title,
        body: messageContent,
      },
      android: {
        priority: "high",
      },
      token: token,
    };

    await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
        successes++;
      })
      .catch((error) => {
        console.log("Error sending message:", error);
        failures++;
      });
  }

  res.json({
    success: true,
    message: "Notifications sent",
    details: { successes, failures },
  });
});

// Start the server and listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
