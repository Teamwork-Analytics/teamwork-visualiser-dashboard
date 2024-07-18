import { useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import ObservationAPI from "../../services/api/observation";
import { startBaselineAll, startAll, stopAll } from "../../services/eureka";
import { useObservation } from "./ObservationContext";

const ObservationPrimaryControlView = () => {
  const { simulationId } = useParams();
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const labels = OBSERVATION_TOAST_MESSAGES(simulationId);

  const { observation, setObservation } = useObservation();

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      height: "28vh",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  };

  const resetAllTime = async (e) => {
    ObservationAPI.resetObservation(observation._id)
      .then((res) => {
        if (res.status === 200 && res.data !== null) {
          setObservation(res.data);
          toast.success("Successfully reset simulation");
        }
      })
      .catch((err) => {
        toast.error(err);
      });
    setIsConfirmDelete(false);
  };

  const areYouSure = () => {
    setIsConfirmDelete(true);
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
    try {
      if (opt === "baselineTime") {
        await startBaselineAll(simulationId);

        // ping FitBit server to start receiving data
        // TODO: make this prettier
        // const response = await fetch("http://localhost:3168/start-simulation", {
        const response = await fetch(`${process.env.REACT_APP_EXPRESS_IP}:3168/start-simulation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ simulationId }),
        });

        console.log("Started baseline with fitbit server")

      } else if (opt === "startTime") {
        await startAll(simulationId);
      } else if (opt === "stopTime") {
        await stopAll();

        // ping FitBit server to stop receiving data
        // TODO: make this prettier
        // const response = await fetch("http://localhost:3168/stop-simulation", {
        const response = await fetch(`${process.env.REACT_APP_EXPRESS_IP}:3168/stop-simulation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Stop recording with fitbit server", );

      } else {
        return;
      }
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div style={styles.wrapper}>
      <Button
        variant="warning"
        value={"baselineTime"}
        onClick={sendRecordedTime}
        disabled={observation.baselineTime !== null}
      >
        Start Baseline
      </Button>
      <Button
        variant="success"
        disabled={observation.startTime !== null}
        value={"startTime"}
        onClick={sendRecordedTime}
      >
        Start Simulation
      </Button>
      <Button
        variant="dark"
        disabled={observation.stopTime !== null}
        value={"stopTime"}
        onClick={sendRecordedTime}
      >
        Stop Simulation
      </Button>
      <ReactTooltip />
      <small style={{ fontSize: "10px" }}>
        Note: Our visualisations are time-sensitive. Once these buttons are
        clicked, they will be disabled. Mistake? please click reset button
        below.
      </small>

      {isConfirmDelete ? (
        <ButtonGroup>
          <Button
            variant="secondary"
            value={"resetAllTime"}
            onClick={() => setIsConfirmDelete(false)}
          >
            No, cancel that.
          </Button>
          <Button
            variant="danger"
            value={"resetAllTime"}
            onClick={resetAllTime}
          >
            Yes, reset!
          </Button>
        </ButtonGroup>
      ) : (
        <Button
          variant="secondary"
          value={"resetAllTime"}
          onClick={areYouSure}
        >
          Reset Simulation
        </Button>
      )}
    </div>
  );
};

export default ObservationPrimaryControlView;
