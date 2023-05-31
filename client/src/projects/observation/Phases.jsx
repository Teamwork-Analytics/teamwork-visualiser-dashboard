import React, { useState } from "react";
import { Container, Modal, Row, Col, Button } from "react-bootstrap";
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
import { manualLabels } from ".";
import { BsXLg } from "react-icons/bs";

const Phases = () => {
  const { notes } = useObservation();

  const [showEditModal, setShowEditModal] = useState(false);
  const handleEditModalClose = () => setShowEditModal(false);
  const handleEditModalShow = () => setShowEditModal(true);
  const [selectedNote, setSelectedNote] = useState(null);

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const handleDeleteConfirmationModalClose = () =>
    setShowDeleteConfirmationModal(false);
  const handleDeleteConfirmationModalShow = () =>
    setShowDeleteConfirmationModal(true);
  const [deletingNote, setDeletingNote] = useState(null);
  const handleDeleteTag = () => {
    console.log("Deleting note: ", deletingNote);
    setDeletingNote(null);
  };

  const phaseLabels = manualLabels.phases.map((phase) => phase.label);

  return (
    <Container className="mt-3" style={{ padding: "0px" }}>
      <div style={{ fontSize: "12px" }}>
        <Clock
          format={"ddd D MMM YYYY, h:mm:ss a"}
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
                        phaseLabels.includes(d.message)
                          ? "secondary"
                          : "warning"
                      }
                      variant={
                        phaseLabels.includes(d.message) ? "filled" : "outlined"
                      }
                    />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Row style={{ marginRight: "0", marginLeft: "0" }}>
                      <Col
                        style={{
                          margin: "auto",
                          paddingLeft: "5px",
                          paddingRight: "5px",
                        }}
                      >
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
                      </Col>
                      <Col
                        xs="auto"
                        style={{
                          margin: "auto",
                          paddingLeft: "5px",
                          paddingRight: "5px",
                        }}
                      >
                        <BsXLg
                          onClick={() => {
                            handleDeleteConfirmationModalShow();
                          }}
                        />
                      </Col>
                    </Row>
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
            Simulation started
          </TimelineContent>
        </TimelineItem>
      </Timeline>

      <Modal show={showEditModal} onHide={handleEditModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit observation</Modal.Title>
        </Modal.Header>
        <Modal.Body> {selectedNote}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleEditModalClose}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteConfirmationModal}
        onHide={handleDeleteConfirmationModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this tag? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleDeleteConfirmationModalClose}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTag}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Phases;
