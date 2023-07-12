/**
 * @fileoverview This file defines the DebriefView component. This component shows
 * the visualisations selected by the controller on the **Projection screen**.
 */
import { useState, useEffect } from "react";
import { socket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import DisplayViz from "./socketComponents/DisplayViz";
import { unpackData } from "../../utils/socketUtils";

import { SocialNetworkView, ENANetworkView } from "../communication";
import TeamworkBarchart from "../teamwork/TeamworkBarchart";
import HiveView from "../hive/HiveView";
import VideoVisualisation from "../observation/visualisationComponents/VideoVisualisation";

const DebriefView = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [dispList, setDispList] = useState([]);
  const [range, setRange] = useState([0, 0]);

  // duplicated - preview stuff
  const imageReferences = {
    commBehaviour: {
      size: "small",
      viz: <ENANetworkView />,
    },

    commNetwork: {
      size: "small",
      viz: <SocialNetworkView timeRange={range} />,
    },
    priorBar: {
      size: "small",
      viz: (
        <TeamworkBarchart
          style={{
            width: "auto",
            objectFit: "scale-down",
            maxHeight: "33vh",
          }}
          fluid
        />
      ),
    },
    wardMap: {
      size: "medium",
      viz: <HiveView timeRange={range} />,
    },
    video: {
      size: "large",
      viz: (
        <VideoVisualisation
          style={{
            width: "auto",
            objectFit: "scale-down",
            maxHeight: "33vh",
            minHeight: "30vh",
          }}
          isVideoTabActive={true}
          fluid
          timeRange={range}
        />
      ),
    },
  };

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

  const decideSize = (d) => {
    if (dispList.length === 1 && d.id !== "videoVis") {
      return "single";
    }
    return imageReferences[d.id].size;
  };

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
        {dispList.length !== 0 ? (
          dispList.map((d, i) => (
            <DisplayViz
              size={decideSize(d)}
              viz={imageReferences[d.id].viz}
              key={i}
            />
          ))
        ) : (
          <div align="center">
            <h1>🔍No visualisations</h1>
            <p>Please select up to three visualisations</p>
          </div>
        )}
      </div>
      <ConnectionState isConnected={isConnected} />
      {!hideConnectButton && <ConnectionManager />}
    </>
  );
};

export default DebriefView;
