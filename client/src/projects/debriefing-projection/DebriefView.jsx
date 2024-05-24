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
import { Box } from "@mui/material";
import ConnectionState from "./socketComponents/ConnectionState";
import ConnectionManager from "./socketComponents/ConnectionManager";
import DisplayViz from "../../components/displays/DisplayViz";
import { unpackData } from "../../utils/socketUtils";
import { useParams } from "react-router-dom";
import Spline from "@splinetool/react-spline";

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

  const onMouseDown = (e) => {
    console.log("I have been clicked!");
  };

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
        {/* <DisplayViz
          selectedVis={dispList}
          range={range}
          optionalHiveState={hiveState}
        /> */}

        <Box
          borderRadius={5}
          p={5}
          sx={{
            backgroundColor: "#E6EBEF",
            width: "350px",
            height: "400px",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Spline
            style={{ width: "100%", height: "100%", alignContent: "center" }}
            scene="https://prod.spline.design/p2v7eOju-kg0Tp9B/scene.splinecode"
            onMouseDown={(e) => onMouseDown(e)}
          />
        </Box>
      </div>
      {/* Display connection state */}
      <ConnectionState isConnected={isConnected} />
      {/* Optionally display ConnectionManager */}
      {!hideConnectButton && <ConnectionManager />}
    </>
  );
};

export default DebriefView;
