const { Server } = require("socket.io");
const logger = require("winston");
const { createActivity } = require("./useractivity");

const createSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? `http://${process.env.IP}:3000`
          : process.env.CURRENT_URL,
      methods: ["GET", "POST"],
    },
    path: "/activities",
  });

  // share the session with Express server
  //   io.of("/activities").use(sharedsession(session));

  // on any connections:
  io.of("/activities").on("connection", (socket) => {
    //FIXME: instead of using "on connection", trigger it based on the login.
    try {
      const simURLlocation = socket.handshake.auth.url;
      logger.info(`${simURLlocation} has connected`);

      // Initialise
      //   socket.on("simulation", (simData) => {
      //     console.log(simData);
      //     const simName = simData.name;
      //     const simId = simData.id;
      //     logger.info(`${simName} (id: ${simId}) has connected`);
      //   });

      socket.onAny((event, data) => {
        data.simulationId = data.id;
        data.name = data.name;
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
};

module.exports = createSocket;
