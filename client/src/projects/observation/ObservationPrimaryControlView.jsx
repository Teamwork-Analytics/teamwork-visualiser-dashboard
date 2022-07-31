import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import ObservationAPI from "../../services/api/observation";
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
    const data = {
      type: opt,
      timeString: new Date(Date.now()).toISOString(),
    };
    ObservationAPI.recordSimTime(observation._id, data).then((res) => {
      if (res.status === 200 && res.data !== null) {
        setObservation(res.data);
        toast.success(message);
      }
    });
  };

  return (
    <div style={styles.wrapper}>
      <Button variant="warning" value={"baselineTime"} onClick={clickButton}>
        Start Baseline
      </Button>
      <Button variant="success" value={"startTime"} onClick={clickButton}>
        Start Simulation
      </Button>
      <Button variant="secondary" value={"stopTime"} onClick={clickButton}>
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
