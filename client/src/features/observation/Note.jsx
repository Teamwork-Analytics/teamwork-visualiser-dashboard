import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { sortNotesDescending } from ".";
import { useObservation } from "./ObservationContext";
import DateTimePicker from "react-datetime-picker";
import "./DateTimePicker.css";
import NursePerformBadges from "./visualisationComponents/NursePerformBadges";
import { updateSinglePhase } from "../../shared/utils/observationUtils";

const Note = ({ initialValue, data }) => {
  const { observation, setNotes } = useObservation();
  const [time, setTime] = useState(new Date(data.timestamp));

  const [value, setValue] = useState(initialValue);

  const saveNote = async () => {
    const updatedData = await updateSinglePhase(
      observation._id,
      data._id,
      value,
      new Date(time)
    );

    // If updatedData is truthy (i.e., the update was successful and data was returned)
    if (updatedData) {
      const phases = sortNotesDescending(updatedData);
      setNotes(phases);
    }
  };

  return (
    <Form>
      <Form.Group as={Row} className="mb-3">
        <Row>
          <Col>
            <DateTimePicker
              maxDetail="second" // allowed to change second
              disableCalendar={true} // not allowed to change date
              disableClock={true} // not showing clock (too complex)
              clearIcon={null} // not allowed to clear value
              maxDate={new Date()} // no future date allowed
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
              autofocus
              onBlur={() => saveNote()}
              autoFocus // default changing note message
            />
          </Col>
        </Row>
        <Row style={{ marginTop: "5px" }}>
          <NursePerformBadges
            noteId={data._id}
            sortNotesDescending={sortNotesDescending}
          />
        </Row>
      </Form.Group>
    </Form>
  );
};

export default Note;
