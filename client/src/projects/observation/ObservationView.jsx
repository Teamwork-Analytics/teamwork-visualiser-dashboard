import React, { Fragment, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";

const ObservationView = () => {
  const [tagData, setTaggedData] = useState([
    {
      label: "Handover",
      timestamp: Date.now(),
    },
  ]);

  const phases = [1, 2, 3, 4];

  const addTag = () => {
    setTaggedData([...tagData, { label: "", timestamp: Date.now() }]);
  };
  const { sessionId } = useParams();

  return (
    <div
      style={{
        margin: "0 auto",
        width: "50vw",
        maxWidth: "1440px",
        height: "100%",
        colour: "white",
      }}
    >
      <h1>Session {sessionId}</h1>
      <div style={{ width: "20vw", margin: "0 auto" }}>
        <Alert variant={"success"}>Status: simulation has started</Alert>
        <label>Start time: {new Date(Date.now()).toLocaleTimeString()} </label>
        <br />
        <label>Stop time: {"-"}</label>
      </div>
      <hr />
      <ButtonGroup className="mx-2">
        {phases.map((d, i) => {
          return (
            <Button
              key={i}
              variant="primary"
              size="lg"
              onClick={() => addTag()}
            >
              Phase {i + 1}
            </Button>
          );
        })}
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="success" size="lg" onClick={() => addTag()}>
          Manual Tag
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            toast.success("Notes are saved!");
          }}
        >
          Save
        </Button>
      </ButtonGroup>

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
          {tagData.map((d) => {
            const timestamp = !!d.timestamp
              ? new Date(d.timestamp).toISOString()
              : "Time error!";
            return (
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="3">
                    {timestamp}
                  </Form.Label>
                  <Col sm="7">
                    <Form.Control placeholder={d.label} />
                    {/* Replace value above with a state! */}
                  </Col>
                  <Col sm="2">
                    <Button variant="danger">Delete</Button>
                  </Col>
                </Form.Group>
              </Form>
            );
          })}
        </div>
      </Container>
    </div>
  );
};
export default ObservationView;
