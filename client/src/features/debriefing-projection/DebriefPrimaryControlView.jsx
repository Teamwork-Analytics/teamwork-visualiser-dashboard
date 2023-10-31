import { useState } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { startDebriefAudio, stopDebriefAudio } from "../../services/eureka";
import { useDebriefing } from "./DebriefContext";
import { processAllVisualisations } from "../../services/py-server";

const DebriefPrimaryControlView = () => {
  const { simulationId } = useParams();
  const { isStarted, setIsStarted } = useDebriefing();
  const [isProcessing, setIsProcessing] = useState(false);

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      height: "28vh",
      flexDirection: "column",
      rowGap: "1em",
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

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      const response = await processAllVisualisations(simulationId);
      if (response) {
        toast.success(response.data);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(false);
  };

  return (
    <div style={styles.wrapper}>
      <Button
        variant="dark"
        value={"baselineTime"}
        onClick={handleClick}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Generate All Visualisations"}
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
