import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import toast from "react-hot-toast";

import ReactTooltip from "react-tooltip";
import { useDebriefing } from "../debriefing-projection/DebriefContext";
import { useParams } from "react-router-dom";
import { startDebriefAudio, stopDebriefAudio } from "../../services/eureka";
import {
  processAllVisualisations,
  processCommBehaviourViz,
  processVideoTranscoding,
} from "../../services/py-server";

const ObservationSecondaryControlView = () => {
  const { simulationId } = useParams();
  const { isStarted, setIsStarted } = useDebriefing();
  const [isProcessingAllViz, setIsProcessingAllViz] = useState(false);
  const [isProcessingENA, setIsProcessingENA] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      flexDirection: "column",
      rowGap: "0.4em",
    },
  };

  const sendRecordedTime = async (e) => {
    const opt = e.target.value;

    if (opt === "startTime") {
      const res = await startDebriefAudio(simulationId);

      if (res.status === 200) {
        toast.success(res.data);
        setIsStarted(true);
      }
    } else if (opt === "stopTime") {
      const res = await stopDebriefAudio(simulationId);
      if (res.status === 200) {
        toast.success(res.data);
        setIsStarted(false);
      }
    } else {
      return;
    }
  };

  const processAllViz = async () => {
    try {
      setIsProcessingAllViz(true);
      const response = await processAllVisualisations(simulationId);
      if (response) {
        toast.success(response.data);
        setIsProcessingAllViz(false);
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessingAllViz(false);
  };

  const generateCommBehaviourViz = async () => {
    try {
      setIsProcessingENA(true);
      const response = await processCommBehaviourViz(simulationId);
      if (response) {
        toast.success(response.data);
        setIsProcessingENA(false);
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessingENA(false);
  };

  const transcodeVideo = async () => {
    try {
      setIsProcessingVideo(true);
      const response = await processVideoTranscoding(simulationId);
      if (response) {
        toast.success(response.data);
        setIsProcessingVideo(false);
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessingVideo(false);
  };

  return (
    <div style={styles.wrapper}>
      <Button
        variant="dark"
        value={"generateAllViz"}
        onClick={processAllViz}
        disabled={isProcessingAllViz}
      >
        {isProcessingAllViz ? "Processing..." : "Generate All Visualisations"}
      </Button>

      <Button
        variant="dark"
        value={"generateENAViz"}
        onClick={generateCommBehaviourViz}
        disabled={isProcessingENA}
      >
        {isProcessingENA ? "Processing..." : "Generate Comm. Behaviour Viz"}
      </Button>

      <Button
        variant="dark"
        value={"transcodeVideo"}
        onClick={transcodeVideo}
        disabled={isProcessingVideo}
      >
        {isProcessingVideo ? "Processing..." : "Transcode Video"}
      </Button>
      <small style={{ fontSize: "0.3em" }}>
        The following buttons are used to record individual debriefer's audio
        via "audio interface" YarnSense system, only from first channel.
      </small>
      <Button
        variant={isStarted ? "secondary" : "success"}
        value={"startTime"}
        onClick={sendRecordedTime}
        disabled={isStarted}
      >
        {isStarted ? "Recording..." : "Start Debriefer Audio Recording"}
      </Button>
      <Button variant="dark" value={"stopTime"} onClick={sendRecordedTime}>
        Stop Debriefer Audio Recording
      </Button>

      <ReactTooltip />
    </div>
  );
};

export default ObservationSecondaryControlView;
