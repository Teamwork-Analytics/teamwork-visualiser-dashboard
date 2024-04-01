import { useState, useEffect } from "react";
import { TimelineProvider } from "./visualisationComponents/TimelineContext";
import { taggingSocket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import { useParams } from "react-router-dom";
import { DebriefingProvider } from "../debriefing-projection/DebriefContext";
import { HiveProvider } from "../visualisations/hive/HiveContext";
import DebriefingControllerView from "./DebriefingControllerView";

const DebriefingControllerModule = () => {
  const { simulationId } = useParams();

  // socket connection
  const hideConnectButton = true;
  const [isConnected, setIsConnected] = useState(taggingSocket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Connected to " + taggingSocket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from " + taggingSocket.id);
    }

    taggingSocket.on("connect", onConnect);
    taggingSocket.on("disconnect", onDisconnect);

    return () => {
      taggingSocket.off("connect", onConnect);
      taggingSocket.off("disconnect", onDisconnect);
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
