import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { useObservation } from "./ObservationContext";
import PhaseButtons from "./PhaseButtons";
import Phases from "./Phases";

const ObservationView = () => {
  const { observation } = useObservation();
  const { simulationId } = useParams();
  const [state, setState] = useState({
    baselineTime: null,
    startTime: null,
    stopTime: null,
  });

  useEffect(() => {
    setState({ ...observation });
  }, [observation]);

  const styles = {
    outer: {
      margin: "0 auto",
      width: "50vw",
      maxWidth: "1440px",
      height: "100%",
      colour: "white",
    },
    info: { width: "20vw", margin: "0 auto" },
  };

  const timeString = (time) => {
    return time === null ? "-" : new Date(time).toLocaleString();
  };

  const AlertCondition = () => {
    let alertColour = "secondary";
    let message = "Baseline has started, but simulation hasn't started yet.";
    if (state.stopTime !== null) {
      alertColour = "success";
      message = "Simulation has stopped & is complete.";
    } else if (state.startTime !== null) {
      alertColour = "warning";
      message = "Simulation has started.";
    }

    return <Alert variant={alertColour}>{`${message}`}</Alert>;
  };

  return (
    <div style={styles.outer}>
      <h1>Session {simulationId}</h1>
      <div style={styles.info}>
        {observation.baselineTime !== null ? <AlertCondition /> : null}
        <label>Baseline time: {timeString(state.baselineTime)} </label>
        <br />
        <label>Start time: {timeString(state.startTime)} </label>
        <br />
        <label>Stop time: {timeString(state.stopTime)}</label>
      </div>
      <hr />
      <PhaseButtons />
      <Phases />
      <ReactTooltip />
    </div>
  );
};

export default ObservationView;
