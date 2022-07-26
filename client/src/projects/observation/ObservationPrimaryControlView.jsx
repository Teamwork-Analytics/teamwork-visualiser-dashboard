import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import { startAll, stopAll } from "../../services/eureka";

const ObservationPrimaryControlView = () => {
  const params = useParams();

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      height: "15vh",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  };

  const clickButton = async (e) => {
    const labels = OBSERVATION_TOAST_MESSAGES(params.teamName);
    const opt = e.target.value;
    const message = labels[opt];
    if (opt === "baseline") {
    } else if (opt === "start") {
      await startAll(params.teamName);
    } else if (opt === "end") {
      await stopAll(params.teamName);
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
    </div>
  );
};

export default ObservationPrimaryControlView;
