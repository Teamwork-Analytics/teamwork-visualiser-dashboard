import React, { useState } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { OBSERVATION_TOAST_MESSAGES } from "../../data/manualLabels";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";

const FullResetButton = () => {
  const { observation, setObservation, setNotes } = useObservation();
  const [isReady, setIsReady] = useState(false);
  const params = useParams();
  const labels = OBSERVATION_TOAST_MESSAGES(params.simulationId);

  const resetAllTimeInObservation = () => {
    ObservationAPI.resetObservation(observation._id).then((res) => {
      if (res.status === 200) {
        setObservation(res.data);
        setNotes(res.data.phases);
        toast.success(labels["reset"]);
        setIsReady(false);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {isReady ? (
        <div style={{ display: "flex", columnGap: "1em" }}>
          <label>Are you sure? </label>
          <Button variant="dark" size="sm" onClick={() => setIsReady(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            value={"reset"}
            onClick={resetAllTimeInObservation}
          >
            Yes, reset
          </Button>
        </div>
      ) : (
        <Button
          variant="danger"
          size="sm"
          value={"reset"}
          onClick={() => {
            setIsReady(true);
          }}
          data-tip="Clicking this button will reset all captured time."
        >
          Full Reset
        </Button>
      )}
    </div>
  );
};

export default FullResetButton;
