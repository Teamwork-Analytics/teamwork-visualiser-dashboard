const { WebSocketServer } = require("ws");
const url = require("url");

// Tracks connected Android devices by deviceId and lets the server push
// messages down to one device or broadcast to all of them.
function createHub(httpServer) {
  const devices = new Map(); // deviceId -> ws

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const { query } = url.parse(req.url, true);
    const deviceId = query.deviceId;

    if (!deviceId) {
      ws.close(1008, "deviceId query param is required");
      return;
    }

    console.log(`Device connected: ${deviceId}`);
    devices.set(deviceId, ws);

    ws.on("message", (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch (err) {
        console.error(`Invalid WS message from ${deviceId}:`, raw.toString());
        return;
      }
      handleIncoming(deviceId, payload);
    });

    ws.on("close", () => {
      console.log(`Device disconnected: ${deviceId}`);
      if (devices.get(deviceId) === ws) {
        devices.delete(deviceId);
      }
    });

    ws.on("error", (err) => {
      console.error(`WS error for device ${deviceId}:`, err.message);
    });
  });

  let onButtonResponse = () => {};

  function handleIncoming(deviceId, payload) {
    if (payload.type === "buttonResponse") {
      onButtonResponse(deviceId, payload);
    }
  }

  function listConnectedDevices() {
    return Array.from(devices.keys());
  }

  function sendMessageTo(deviceId, message) {
    const ws = devices.get(deviceId);
    if (!ws || ws.readyState !== ws.OPEN) {
      return false;
    }
    ws.send(JSON.stringify({ type: "message", text: message, sentAt: new Date().toISOString() }));
    return true;
  }

  function broadcastMessage(message) {
    const targeted = [];
    for (const deviceId of devices.keys()) {
      if (sendMessageTo(deviceId, message)) {
        targeted.push(deviceId);
      }
    }
    return targeted;
  }

  return {
    listConnectedDevices,
    sendMessageTo,
    broadcastMessage,
    onButtonResponse: (cb) => {
      onButtonResponse = cb;
    },
  };
}

module.exports = { createHub };
