import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";

const Note = ({ initialValue, data }) => {
  const { observation, setNotes } = useObservation();
  const timestamp = !!data.timestamp
    ? new Date(data.timestamp).toLocaleTimeString()
    : "Time error!";

  const [value, setValue] = useState(initialValue);

  const saveNote = () => {
    const updateInfo = {
      noteId: data._id,
      message: value,
    };
    ObservationAPI.updateNote(observation._id, updateInfo).then((res) => {
      if (res.status === 200) {
        toast.success("Note has been updated!");
      }
    });
  };

  const deleteNote = (noteId) => {
    // const newArray = notes.filter((d) => d._id !== noteId);
    ObservationAPI.deleteNote(observation._id, noteId).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  };

  return (
    <Form>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm="3">
          {timestamp}
        </Form.Label>
        <Col sm="7">
          <Form.Control
            placeholder={data.message}
            onChange={(e) => setValue(e.target.value)}
            value={value}
            onBlur={() => saveNote()}
          />
        </Col>
        <Col sm="2">
          <Button
            id={data._id}
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
