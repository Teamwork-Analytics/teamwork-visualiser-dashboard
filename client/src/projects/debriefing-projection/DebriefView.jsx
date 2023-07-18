/**
 * @fileoverview This file defines the DebriefView component. This component shows
 * the visualisations selected by the controller on the **Projection screen**.
 */
import { useState, useEffect } from "react";
import { socket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import DisplayViz from "../../components/displays/DisplayViz";
import { unpackData } from "../../utils/socketUtils";

const DebriefView = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [dispList, setDispList] = useState([]);
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Connected to " + socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from " + socket.id);
    }

    function onUpdateList(data) {
      console.log("Received controller change to display: " + data);
      const unpackedData = unpackData(data);
      const parsedList = unpackedData.vizSelected;
      setRange(unpackedData.range);
      setDispList(parsedList); // WARNING: abrupt mutation
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-disp-list", onUpdateList);

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
        <DisplayViz selectedVis={dispList} range={range} />
      </div>
      <ConnectionState isConnected={isConnected} />
      {!hideConnectButton && <ConnectionManager />}
    </>
  );
};

export default DebriefView;
