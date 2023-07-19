import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

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
        // refresh notes on the page
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
        <Row>
          <Col>
            <DateTimePicker
              maxDetail="second"
              onChange={(value) => {
                setTime(value);
              }}
              value={time}
              onBlur={() => saveNote()}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: "5px" }}>
          <Col>
            <Form.Control
              placeholder={data.message}
              onChange={(e) => setValue(e.target.value)}
              value={value}
              onBlur={() => saveNote()}
            />
          </Col>
        </Row>
      </Form.Group>
    </Form>
  );
};

export default Note;
