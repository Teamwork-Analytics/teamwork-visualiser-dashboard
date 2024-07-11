import React, { useState } from "react";
import axios from "axios";

const NotificationSender = () => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [response, setResponse] = useState(null);

  const sendNotification = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4222/send-notification",
        {
          title,
          message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponse(res.data);
    } catch (error) {
      console.error("Error sending notification:", error);
      setResponse({ success: false, message: "Failed to send notification" });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Send Notification</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px", width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: "10px", width: "100%", height: "100px" }}
        />
      </div>
      <button onClick={sendNotification} style={{ padding: "10px 20px" }}>
        Send Notification
      </button>
      {/* {response && (
        <div style={{ marginTop: "20px" }}>
          <h2>Response</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )} */}
    </div>
  );
};

export default NotificationSender;
