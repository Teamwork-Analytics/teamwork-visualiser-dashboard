/**
 * DebriefView Component
 *
 * This component manages and displays visualizations selected by the controller on the Projection screen.
 *
 * It establishes a socket connection, and on connection receives data that determines which visualizations to display.
 * The component also manages the connection state and displays the connection status.
 *
 * ConnectionManager component is optional and can be displayed based on the `hideConnectButton` flag.
 */

import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import ConnectionState from "./socketComponents/ConnectionState";
import ConnectionManager from "./socketComponents/ConnectionManager";
import DisplayViz from "../../components/displays/DisplayViz";
import { unpackData } from "../../utils/socketUtils";

const DebriefView = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [dispList, setDispList] = useState([]);
  const [range, setRange] = useState([0, 0]);

  // Connection and data update events handlers
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log(`Connected to ${socket.id}`);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log(`Disconnected from ${socket.id}`);
    };

    const onUpdateList = (data) => {
      console.log(`Received controller change to display: ${data}`);
      const unpackedData = unpackData(data);
      const parsedList = unpackedData.vizSelected;
      setRange(unpackedData.range);
      setDispList(parsedList); // WARNING: abrupt mutation
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-disp-list", onUpdateList);

    // Cleanup function for useEffect
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-disp-list", onUpdateList);
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
          width: "100vw",
          height: "90vh",
          maxHeight: "90vh",
          flexWrap: "wrap",
        }}
      >
        {/* Display the selected visualisations with the received range */}
        <DisplayViz selectedVis={dispList} range={range} />
      </div>
      {/* Display connection state */}
      <ConnectionState isConnected={isConnected} />
      {/* Optionally display ConnectionManager */}
      {!hideConnectButton && <ConnectionManager />}
    </>
  );
};

export default DebriefView;
