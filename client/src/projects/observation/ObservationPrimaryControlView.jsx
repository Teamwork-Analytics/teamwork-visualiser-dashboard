import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import { startAll, stopAll } from "../../services/eureka";
import { useObservation } from "./ObservationContext";

const ObservationPrimaryControlView = () => {
  const params = useParams();
  const { observation, setObservation } = useObservation();

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      height: "17vh",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  };

  const clickButton = async (e) => {
    const labels = OBSERVATION_TOAST_MESSAGES(params.simulationId);
    const opt = e.target.value;
    const message = labels[opt];
    if (opt === "baseline") {
      setObservation({ ...observation, baselineTime: Date.now() });
    } else if (opt === "start") {
      setObservation({ ...observation, startTime: Date.now() });
      // await startAll(params.simulationId);
    } else if (opt === "stop") {
      setObservation({ ...observation, stopTime: Date.now() });
      // await stopAll(params.simulationId);
    } else if (opt === "reset") {
      setObservation({
        ...observation,
        baselineTime: null,
        startTime: null,
        stopTime: null,
      });
    }
    toast.success(message);
  };

  return (
    <div style={styles.wrapper}>
      <Button variant="warning" value={"baseline"} onClick={clickButton}>
        Start Baseline
      </Button>
      <Button variant="success" value={"start"} onClick={clickButton}>
        Start Simulation
      </Button>
      <Button variant="secondary" value={"stop"} onClick={clickButton}>
        Stop Simulation
      </Button>
      <hr />
      <Button
        variant="danger"
        size="sm"
        value={"reset"}
        onClick={clickButton}
        data-tip="Clicking this button will reset all captured time."
      >
        Reset Time
      </Button>
      <ReactTooltip />
    </div>
  );
};

export default ObservationPrimaryControlView;
