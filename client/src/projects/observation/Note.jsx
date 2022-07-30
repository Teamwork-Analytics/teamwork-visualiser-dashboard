import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useObservation } from "./ObservationContext";

const Note = ({ initialValue, data }) => {
  const { notes, setNotes } = useObservation();
  const timestamp = !!data.timestamp
    ? new Date(data.timestamp).toLocaleTimeString()
    : "Time error!";

  const deleteNote = (id) => {
    const newArray = notes.filter((d) => d.id !== id);
    setNotes(newArray);
  };
  const [value, setValue] = useState(initialValue);

  return (
    <Form>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm="3">
          {timestamp}
        </Form.Label>
        <Col sm="7">
          <Form.Control
            placeholder={data.label}
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          {/* Replace value above with a state! */}
        </Col>
        <Col sm="2">
          <Button
            id={data.id}
            variant="danger"
            onClick={(e) => {
              deleteNote(e.target.id);
            }}
          >
            Delete
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Note;
