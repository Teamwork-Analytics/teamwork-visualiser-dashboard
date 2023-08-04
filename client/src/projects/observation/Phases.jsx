import { useState } from "react";
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
import { BsXLg, BsStar, BsStarFill } from "react-icons/bs";
import ObservationAPI from "../../services/api/observation";
import { sortNotesDescending } from ".";
import { COLOURS } from "../../config/colours";
import { useTracking } from "react-tracking";

const Phases = () => {
  const { Track, trackEvent } = useTracking({ page: "Observation" });
  const { observation, notes, setNotes } = useObservation();

  // TODO: migrate to somewhere else or back to Note.jsx after demo
  const deleteNote = (noteId) => {
    // const newArray = notes.filter((d) => d._id !== noteId);
    ObservationAPI.deleteNote(observation._id, noteId).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const handleEditModalClose = () => setShowEditModal(false);
  const handleEditModalShow = () => setShowEditModal(true);
  const [selectedNote, setSelectedNote] = useState(null);

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const handleDeleteConfirmationModalClose = () => {
    setShowDeleteConfirmationModal(false);
    setDeletingNoteId(null);
  };
  const handleDeleteConfirmationModalShow = () =>
    setShowDeleteConfirmationModal(true);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const handleDeleteTag = () => {
    deleteNote(deletingNoteId);
    setDeletingNoteId(null);
    handleDeleteConfirmationModalClose();
  };

  const handleFavourite = (noteId) => {
    ObservationAPI.updateFavourite(observation._id, noteId, true)
      .then((res) => {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      })
      .catch((err) => console.error(err));
  };
  const handleUnfavourite = (noteId) => {
    ObservationAPI.updateFavourite(observation._id, noteId, false)
      .then((res) => {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      })
      .catch((err) => console.error(err));
  };

  const phaseLabels = manualLabels.phases.map((phase) => phase.label);

  return (
    <Track>
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

                // calculate time difference for distance between notes
                let timeDifferenceInPx;
                if (i < notes.length - 1) {
                  const nextDate = new Date(notes[i + 1].timestamp);
                  const timeDifferenceInSeconds = Math.abs(
                    (nextDate - date) / 1000
                  );
                  const scaleFactor = 1; // 1 second = `scaleFactor` px
                  timeDifferenceInPx = timeDifferenceInSeconds * scaleFactor;
                }

                return (
                  <TimelineItem key={keyString} style={{ minHeight: "auto" }}>
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
                          phaseLabels.includes(d.message)
                            ? "filled"
                            : "outlined"
                        }
                      />
                      <TimelineConnector
                        style={{
                          // for length proportion to time difference
                          minHeight: timeDifferenceInPx + 2,
                        }}
                      />
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
                              trackEvent({
                                action: "click",
                                element: "editNoteOnTimeline",
                                data: d._id + "-" + d.message,
                              });
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
                          x
                        >
                          {d.favourite ? (
                            <BsStarFill
                              style={{ color: COLOURS.SECONDARY_NURSE_2 }}
                              onClick={() => {
                                trackEvent({
                                  action: "click",
                                  element: "unfavouriteNoteOnTimeline",
                                  data: d._id + "-" + d.message,
                                });
                                handleUnfavourite(d._id);
                              }}
                            />
                          ) : (
                            <BsStar
                              onClick={() => {
                                trackEvent({
                                  action: "click",
                                  element: "favouriteNoteOnTimeline",
                                  data: d._id + "-" + d.message,
                                });
                                handleFavourite(d._id);
                              }}
                            />
                          )}
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
                              trackEvent({
                                action: "click",
                                element: "deleteNoteOnTimeline",
                                data: d._id + "-" + d.message,
                              });
                              setDeletingNoteId(d._id);
                              handleDeleteConfirmationModalShow();
                            }}
                          />
                        </Col>
                      </Row>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
          {/* Starting time */}
          {/* // TODO: grab simulation start time */}
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
            <Button
              variant="primary"
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "saveButtonCloseEditNoteModal",
                });
                handleEditModalClose();
              }}
            >
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
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "cancelDeleteNoteInModal",
                });
                handleDeleteConfirmationModalClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "confirmDeleteNoteInModal",
                });
                handleDeleteTag();
              }}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Track>
  );
};

export default Phases;
