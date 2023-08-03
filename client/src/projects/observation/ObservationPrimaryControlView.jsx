import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import ObservationAPI from "../../services/api/observation";
import { startBaselineAll, startAll, stopAll } from "../../services/eureka";
import { useObservation } from "./ObservationContext";

const ObservationPrimaryControlView = () => {
  const { simulationId } = useParams();
  const labels = OBSERVATION_TOAST_MESSAGES(simulationId);

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

  const sendRecordedTime = async (e) => {
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
    try{
      if (opt === "baselineTime") {
        await startBaselineAll(simulationId);
      } else if (opt === "startTime") {
        await startAll(simulationId);
      } else if (opt === "stopTime") {
        await stopAll();
      } else {
        return;
      }
    }
    catch(err){
      toast.error(err)
    }
    
  };

  return (
    <div style={styles.wrapper}>
      <Button
        variant="warning"
        value={"baselineTime"}
        onClick={sendRecordedTime}
        // disabled={observation.baselineTime !== null}
      >
        Start Baseline
      </Button>
      <Button
        variant="success"
        // disabled={observation.startTime !== null}
        value={"startTime"}
        onClick={sendRecordedTime}
      >
        Start Simulation
      </Button>
      <Button
        variant="secondary"
        // disabled={observation.stopTime !== null}
        value={"stopTime"}
        onClick={sendRecordedTime}
      >
        Stop Simulation
      </Button>
      <ReactTooltip />
    </div>
  );
};

export default ObservationPrimaryControlView;
