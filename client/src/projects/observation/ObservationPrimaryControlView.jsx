import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import { startAll, stopAll } from "../../services/eureka";

const ObservationPrimaryControlView = () => {
  const params = useParams();

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
    const labels = OBSERVATION_TOAST_MESSAGES(params.sessionId);
    const opt = e.target.value;
    const message = labels[opt];
    if (opt === "baseline") {
    } else if (opt === "start") {
      await startAll(params.sessionId);
    } else if (opt === "end") {
      await stopAll(params.sessionId);
    } else if (opt === "reset") {
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
      <Button variant="secondary" value={"end"} onClick={clickButton}>
        End Simulation
      </Button>
      <hr />
      <Button
        variant="danger"
        size="sm"
        value={"reset"}
        onClick={clickButton}
        data-tip="Clicking this button will reset all captured time."
      >
        RESET
      </Button>
      <ReactTooltip />
    </div>
  );
};

export default ObservationPrimaryControlView;
