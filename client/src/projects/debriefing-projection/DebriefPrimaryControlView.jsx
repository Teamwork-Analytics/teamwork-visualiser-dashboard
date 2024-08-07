import { useState } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { startDebriefAudio, stopDebriefAudio } from "../../services/eureka";
import { useDebriefing } from "./DebriefContext";
import {
  processAllVisualisations,
  processCommBehaviourViz,
} from "../../services/py-server";

const DebriefPrimaryControlView = () => {
  const { simulationId } = useParams();
  const { isStarted, setIsStarted } = useDebriefing();
  const [isProcessingAllViz, setIsProcessingAllViz] = useState(false);
  const [isProcessingENA, setIsProcessingENA] = useState(false);

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

  return (
    <div style={styles.wrapper}>
      <Button
        variant="dark"
        value={"baselineTime"}
        onClick={processAllViz}
        disabled={isProcessingAllViz}
      >
        {isProcessingAllViz ? "Processing..." : "Generate All Visualisations"}
      </Button>

      <Button
        variant="dark"
        value={"baselineTime"}
        onClick={generateCommBehaviourViz}
        disabled={isProcessingENA}
      >
        {isProcessingENA ? "Processing..." : "Generate Comm. Behaviour Viz"}
      </Button>

      <Button
        variant={isStarted ? "secondary" : "success"}
        value={"startTime"}
        onClick={sendRecordedTime}
        disabled={isStarted}
      >
        {isStarted ? "Recording..." : "Start Audio Recording"}
      </Button>
      <Button variant="dark" value={"stopTime"} onClick={sendRecordedTime}>
        Stop Audio Recording
      </Button>
      <ReactTooltip />
    </div>
  );
};

export default DebriefPrimaryControlView;
