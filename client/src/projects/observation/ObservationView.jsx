import React, { Fragment } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Row,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { manualLabels } from ".";
import Note from "./Note";
import { ObservationProvider, useObservation } from "./ObservationContext";

const ObservationViewComponent = () => {
  const { notes, setNotes } = useObservation();

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

  const addNote = (label = "") => {
    setNotes((oldArray) => [
      {
        id: Date.now().toString(),
        label: label,
        timestamp: Date.now(),
      },
      ...oldArray,
    ]);
  };

  const { sessionId } = useParams();

  const Buttons = (
    <>
      <ButtonGroup className="mx-2 my-2">
        {manualLabels.phases.map((d, i) => {
          return (
            <Button
              key={i}
              variant="primary"
              size="lg"
              onClick={() => addNote(d.label)}
              data-tip={d.description}
            >
              {d.label}
            </Button>
          );
        })}
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary" size="lg" onClick={() => addNote()}>
          Manual Tag +
        </Button>
        <Button
          variant="success"
          size="lg"
          onClick={() => {
            toast.success("Notes are saved!");
          }}
        >
          Save
        </Button>
      </ButtonGroup>
    </>
  );

  const NotesTable = (
    <>
      <Container className="mt-3">
        <Row>
          <Col sm="3">
            <h3>Timestamp</h3>
          </Col>
          <Col sm="7">
            <h3>Note</h3>
          </Col>
          <Col sm="2">
            <h3>Action</h3>
          </Col>
        </Row>
        <div className="mt-2">
          {notes.length === 0 ? (
            <label>No available notes yet.</label>
          ) : (
            notes.map((d, i) => {
              const keyString = `note-${i}`;
              return (
                <Note
                  id={keyString}
                  initialValue={d.label}
                  key={d.id}
                  data={d}
                />
              );
            })
          )}
        </div>
      </Container>
    </>
  );

  return (
    <div style={styles.outer}>
      <h1>Session {sessionId}</h1>
      <div style={styles.info}>
        <Alert variant={"success"}>Status: simulation has started</Alert>
        <label>Start time: {new Date(Date.now()).toLocaleString()} </label>
        <br />
        <label>Stop time: {"-"}</label>
      </div>
      <hr />
      {Buttons}
      {NotesTable}
      <ReactTooltip />
    </div>
  );
};

const ObservationView = () => {
  return (
    <ObservationProvider>
      <ObservationViewComponent />
    </ObservationProvider>
  );
};
export default ObservationView;
