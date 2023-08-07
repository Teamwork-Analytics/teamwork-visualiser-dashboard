const { Server } = require("socket.io");
const logger = require("winston");
const { createActivity } = require("./useractivity");

const createSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? [`http://${process.env.IP}:3000`, "http://localhost:3000"]
          : process.env.CURRENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // Namespace for activities
  const activitiesNamespace = io.of("/activities");

  // on any connections:
  activitiesNamespace.on("connection", (socket) => {
    try {
      const simURLlocation = socket.handshake.auth.url;
      logger.info(`${simURLlocation} has connected`);

      socket.onAny((event, data) => {
        data.simulationId = data.id;
        data.simNumId = data.name;
        data.serverTime = new Date();
        createActivity(data);
        logger.info(
          `${data.name} = page:${data.page} - action:${data.action} ${data.element}`
        );
      });

      socket.on("disconnect", () => {
        logger.info(`${simURLlocation} has disconnected`);
      });
    } catch (err) {
      logger.error("a simulation has connected, but no simulation id found");
      logger.error(err);
    }
  });

  // Namespace for tagging
  const taggingNamespace = io.of("/tagging");

  taggingNamespace.on("connection", (socket) => {
    console.log(
      "Socket.io connected to socket (tagging namespace): " + socket.id
    );

    socket.on("send-disp-list", (list) => {
      console.log("Received from controller: " + list);
      taggingNamespace.emit("receive-disp-list", list);
      console.log("Broadcasted the signal above to monitor");
    });

    socket.on("send-prepared-signal", (signalPackage) => {
      console.log("Received prepared from server");
      taggingNamespace.emit("receive-prepared-signal", signalPackage);
      console.log("Broadcasted the signal to client");
    });

    socket.on("send-nurse-filter", (nurseFilter) => {
      console.log("Received nurse filter from server");
      taggingNamespace.emit("receive-nurse-filter", nurseFilter);
      console.log("Broadcasted nurse filter to client");
    });
  });
};

module.exports = createSocket;
