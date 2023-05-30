import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";

const Note = ({ initialValue, data }) => {
  const { observation, setNotes } = useObservation();
  const [time, setTime] = useState(new Date(data.timestamp));

  const [value, setValue] = useState(initialValue);

  const saveNote = () => {
    const updateInfo = {
      noteId: data._id,
      message: value,
      timeString: new Date(time).toISOString(),
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

  const dateFormatter = (newTime) => {
    const date = new Date();
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? "+" : "-",
      pad = function (num) {
        return (num < 10 ? "0" : "") + num;
      };
    const formattedTime =
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      newTime +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ":" +
      pad(Math.abs(tzo) % 60);

    setTime(new Date(formattedTime));
  };

  return (
    <Form>
      <Form.Group as={Row} className="mb-3">
        <Col sm="3">
          <Form.Control
            type={"time"}
            value={time.toLocaleTimeString() + `.${time.getMilliseconds()}`}
            step="0.01"
            onChange={(e) => {
              dateFormatter(e.target.value);
            }}
            onBlur={() => saveNote()}
            style={{ color: "black" }}
          />
        </Col>

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
