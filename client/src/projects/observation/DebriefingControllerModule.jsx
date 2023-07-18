import { useState, useEffect } from "react";
import { TimelineProvider } from "./visualisationComponents/TimelineContext";
import { socket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import { useParams } from "react-router-dom";
import { DebriefingProvider } from "../debriefing-projection/DebriefContext";
import { HiveProvider } from "../hive/HiveContext";
import DebriefingControllerView from "./DebriefingControllerView";

const DebriefingControllerModule = () => {
  const { simulationId } = useParams();

  // socket connection
  const hideConnectButton = true;
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Connected to " + socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from " + socket.id);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TimelineProvider simulationId={simulationId}>
        <DebriefingProvider simulationId={simulationId}>
          <HiveProvider simulationId={simulationId}>
            <DebriefingControllerView />
          </HiveProvider>
        </DebriefingProvider>
      </TimelineProvider>
      <ConnectionState isConnected={isConnected} />
      {!hideConnectButton && <ConnectionManager />}
    </div>
  );
};

export default DebriefingControllerModule;
