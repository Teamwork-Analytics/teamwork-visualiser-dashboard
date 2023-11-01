/**
 * @file DebriefView Component
 *
 * @description
 * This component manages and displays visualizations selected by the controller on the Projection screen.
 * It establishes a socket connection, and on connection receives data that determines which visualizations to display.
 * The component also manages the connection state and displays the connection status.
 */

import { useState, useEffect } from "react";
import { taggingSocket } from "./socket";
import ConnectionState from "./socketComponents/ConnectionState";
import ConnectionManager from "./socketComponents/ConnectionManager";
import DisplayViz from "@components/displays/DisplayViz";
import { unpackData } from "../../utils/socketUtils";
import { useParams } from "react-router-dom";

const DebriefView = () => {
  const [isConnected, setIsConnected] = useState(taggingSocket.connected);
  const [dispList, setDispList] = useState([]);
  const [range, setRange] = useState([0, 0]);
  const [hiveState, setHiveState] = useState();

  const params = useParams();

  // Connection and data update events handlers
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log(`Connected to ${taggingSocket.id}`);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log(`Disconnected from ${taggingSocket.id}`);
    };

    const onUpdateList = (data) => {
      console.log(`Received controller change to display: ${data}`);
      const unpackedData = unpackData(data);

      if (unpackedData.simId !== params.simulationId) {
        return;
      }
      const parsedList = unpackedData.vizSelected;
      setRange(unpackedData.range);
      setDispList(parsedList); // WARNING: abrupt mutation
    };

    const onReceiveNurseFilter = (hiveState) => {
      setHiveState(hiveState);
    };

    taggingSocket.on("connect", onConnect);
    taggingSocket.on("disconnect", onDisconnect);
    taggingSocket.on("receive-disp-list", onUpdateList);
    taggingSocket.on("receive-nurse-filter", onReceiveNurseFilter);

    // Cleanup function for useEffect
    return () => {
      taggingSocket.off("connect", onConnect);
      taggingSocket.off("disconnect", onDisconnect);
      taggingSocket.off("receive-disp-list", onUpdateList);
      taggingSocket.off("receive-nurse-filter", onReceiveNurseFilter);
    };
  }, []);

  const hideConnectButton = true;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          maxHeight: "90vh",
          flexWrap: "wrap",
          backgroundColor: "white",
        }}
      >
        {/* Display the selected visualisations with the received range */}
        <DisplayViz
          selectedVis={dispList}
          range={range}
          optionalHiveState={hiveState}
        />
      </div>
      {/* Display connection state */}
      <ConnectionState isConnected={isConnected} />
      {/* Optionally display ConnectionManager */}
      {!hideConnectButton && <ConnectionManager />}
    </>
  );
};

export default DebriefView;
