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

// images
import behaviourVis from "./images/behaviour-vis.png";
import communicationVis from "./images/communication-vis.png";
import mapVis from "./images/ward-map.png";
import videoVis from "./images/video-vis.png";
import priorBar from "../../images/vis/prioritisation-bar.png";

const DebriefView = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [dispList, setDispList] = useState([]);

  const imageReferences = {
    commBehaviour: { size: "small", imageUrl: behaviourVis },
    commNetwork: { size: "small", imageUrl: communicationVis },
    priorBar: { size: "small", imageUrl: priorBar },
    wardMap: { size: "medium", imageUrl: mapVis },
    video: { size: "large", imageUrl: videoVis },
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
          dispList.map((d) => (
            <DisplayViz
              size={decideSize(d)}
              image={imageReferences[d.id].imageUrl}
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
