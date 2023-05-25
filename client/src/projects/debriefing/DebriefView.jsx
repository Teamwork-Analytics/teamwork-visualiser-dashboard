import React from "react";
import { Alert, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { useDebriefing } from "./DebriefContext";

const DebriefView = () => {
  const { simulationId } = useParams();
  const { isStarted } = useDebriefing();

  const styles = {
    outer: {
      margin: "0 auto",
      width: "50vw",
      maxWidth: "1440px",
      height: "100%",
      colour: "black",
    },
    info: { width: "20vw", margin: "0 auto" },
  };

  const AlertCondition = () => {
    let alertColour = "secondary";
    let message = "Audio system hasn't started.";
    if (isStarted === true) {
      alertColour = "success";
      message = "Audio system has started.";
    }
    return <Alert variant={alertColour}>{`${message}`}</Alert>;
  };

  return (
    <div style={styles.outer}>
      <h1>Session {simulationId}</h1>
      <div style={styles.info}>
        <AlertCondition />
        <p>Pre-debriefing Checklist</p>
      </div>
      <hr />
      <Form style={{ width: "20vw", margin: "0 auto", textAlign: "left" }}>
        <Form.Group className="mb-3" controlId="zoom">
          <Form.Check type="checkbox" label="Connected to Zoom" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="share-screen">
          <Form.Check
            type="checkbox"
            label="Screen in the debriefing room is shared"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="screen-recording">
          <Form.Check type="checkbox" label="Screen recording is on" />
        </Form.Group>
      </Form>

      <ReactTooltip />
    </div>
  );
};

export default DebriefView;
