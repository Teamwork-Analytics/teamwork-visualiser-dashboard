import React, { useState } from "react";
import { Container, Modal } from "react-bootstrap";
import Note from "./Note";
import { useObservation } from "./ObservationContext";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import Clock from "react-live-clock";

const Phases = () => {
  const { notes } = useObservation();

  const [showEditModal, setShowEditModal] = useState(false);
  const handleEditModalClose = () => setShowEditModal(false);
  const handleEditModalShow = () => setShowEditModal(true);
  const [selectedNote, setSelectedNote] = useState(null);

  return (
    <Container className="mt-3" style={{ padding: "0px" }}>
      <div style={{ fontSize: "12px" }}>
        <Clock
          format={"h:mm:ss a"}
          ticking={true}
          timezone={"Australia/Melbourne"}
        />
      </div>

      <Timeline
        style={{
          paddingLeft: "0px",
          paddingRight: "0px",
          maxWidth: "50vw",
          margin: "auto",
        }}
      >
        {notes.length === 0
          ? null
          : notes.map((d, i) => {
              const keyString = `note-${i}`;
              let date = new Date(d.timestamp);
              let timeString = date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              });

              return (
                <TimelineItem key={keyString}>
                  <TimelineOppositeContent
                    color="grey"
                    style={{ fontSize: "12px", maxWidth: "120px" }}
                  >
                    {timeString}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot
                      color={
                        ["Ward Nurse", "Handover", "MET Doctor"].includes(
                          d.message
                        )
                          ? "error"
                          : "primary"
                      }
                      variant={
                        ["Ward Nurse", "Handover", "MET Doctor"].includes(
                          d.message
                        )
                          ? "filled"
                          : "outlined"
                      }
                    />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Container
                      style={{
                        backgroundColor: "white",
                        color: "black",
                        padding: "2px",
                        textAlign: "center",
                        fontSize: "14px",
                        borderRadius: "3px",
                      }}
                      onClick={() => {
                        setSelectedNote(
                          <Note
                            id={keyString}
                            initialValue={d.message}
                            key={d._id}
                            data={d}
                          />
                        );
                        handleEditModalShow();
                      }}
                    >
                      {d.message}
                    </Container>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
        <TimelineItem>
          <TimelineOppositeContent
            style={{ minWidth: "120px", maxWidth: "120px" }}
          />

          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent style={{ fontSize: "12px" }}>
            Simulation start
          </TimelineContent>
        </TimelineItem>
      </Timeline>

      <Modal show={showEditModal} onHide={handleEditModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit observation</Modal.Title>
        </Modal.Header>
        <Modal.Body> {selectedNote}</Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Phases;
