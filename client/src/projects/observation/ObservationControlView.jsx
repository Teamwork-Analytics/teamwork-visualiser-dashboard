import { Button, ButtonGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";

const ObservationControlView = () => {
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

  const clickButton = (e) => {
    const labels = OBSERVATION_TOAST_MESSAGES(params.sessionId);
    toast.success(labels[e.target.value]);
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

export default ObservationControlView;
