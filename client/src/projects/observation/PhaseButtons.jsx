import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { manualLabels, sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";
import {
  BsCircleFill,
  BsCircle,
  BsPinAngleFill,
  BsFillMicFill,
  BsMicMuteFill,
} from "react-icons/bs";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import toast from "react-hot-toast";
import { COLOURS } from "../../config/colours";
import { useTracking } from "react-tracking";

const PhaseButtons = () => {
  const { Track, trackEvent } = useTracking({ page: "Observation" });

  // Speech recognition library, see https://webspeechrecognition.com/
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Check if browser supports speech recognition
  if (!browserSupportsSpeechRecognition) {
    console.log("Browser doesn't support speech recognition.");
  }

  const { observation, setNotes } = useObservation();

  const addNote = (label = "") => {
    const toastId = toast.loading("Loading...");
    const data = {
      message: label,
      timeString: new Date(Date.now()).toISOString(),
    };

    ObservationAPI.recordNote(observation._id, data).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
        toast.success("Action tagged", {
          id: toastId,
        });
      } else {
        toast.error("Error tagging action", {
          id: toastId,
        });
      }
    });
  };

  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const handleCreateNoteModalClose = () => {
    setShowCreateNoteModal(false);
    setLabel(""); // Clear the label input
  };
  const handleCreateNoteModalShow = () => setShowCreateNoteModal(true);

  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(transcript);
  }, [transcript]);

  const handleSubmit = () => {
    addNote(label);
    handleCreateNoteModalClose();
  };

  const [filterKeyEvent, setFilterKeyEvent] = useState("");

  return (
    <Track>
      <div style={{ marginTop: "10px" }}>
        <Row>
          <Col style={{ paddingRight: "0px" }}>
            <Container
              style={{
                padding: "2px",
                borderStyle: "solid",
                borderColor: "#CCCCCC",
                borderRadius: "15px",
                backgroundColor: "#F0F0F0",
                paddingBottom: "10px",
              }}
            >
              <Row
                style={{
                  marginTop: "5px",
                  marginBottom: "5px",
                  marginRight: "0",
                  marginLeft: "0",
                }}
              >
                <Col
                  style={{
                    margin: "auto",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  <h5 style={{ margin: "auto" }}> Key events</h5>
                </Col>
                <Col
                  xs="auto"
                  style={{
                    margin: "auto",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    Tag <br /> event
                  </div>
                </Col>
              </Row>

              {manualLabels.phases
                .filter((d) => d.label !== "Teamwork actions") // TODO: remove hardcoded value
                .map((d, i) => {
                  return (
                    <div key={i}>
                      <Row
                        style={{
                          marginBottom: "10px",
                          marginTop: "10px",
                          marginRight: "0",
                          marginLeft: "0",
                        }}
                      >
                        <Col
                          style={{
                            margin: "auto",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                          }}
                        >
                          <Button
                            key={d._id}
                            id={d._id}
                            variant="light"
                            size="md"
                            onClick={() => {
                              trackEvent({
                                action: "click",
                                element: `${d.label}KeyEventFilterButton`,
                                data: d,
                              });
                              setFilterKeyEvent(d._id);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              backgroundColor:
                                filterKeyEvent === d._id ? "#e1e6eb" : "",
                              borderColor:
                                filterKeyEvent === d._id ? "#e1e6eb" : "",
                            }}
                            active={filterKeyEvent === d._id}
                          >
                            <Row
                              style={{ marginLeft: "0px", marginRight: "0px" }}
                            >
                              <Col
                                xs="auto"
                                style={{
                                  margin: "auto",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <BsCircleFill
                                  size="0.5em"
                                  color={COLOURS.KEY_EVENT_PURPLE} // color from MUI default theme
                                />
                              </Col>
                              <Col
                                style={{
                                  margin: "auto",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                {d.label}
                              </Col>
                            </Row>
                          </Button>
                        </Col>
                        <Col
                          xs="auto"
                          style={{
                            margin: "auto",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                          }}
                        >
                          <Button
                            key={d._id}
                            id={d._id}
                            variant="light"
                            style={{
                              width: "100%",
                              margin: "auto",
                            }}
                            onClick={() => {
                              trackEvent({
                                action: "click",
                                element: `${d.label}PinningKeyEventButton`,
                                data: d,
                              });
                              setFilterKeyEvent(d._id);
                              addNote(d.label);
                            }}
                          >
                            <BsPinAngleFill />
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
            </Container>
            <Container
              style={{
                marginTop: "10px",
                padding: "2px",
                borderStyle: "solid",
                borderColor: "#CCCCCC",
                borderRadius: "15px",
                backgroundColor: "#F0F0F0",
                paddingBottom: "10px",
              }}
            >
              <Row
                style={{
                  marginTop: "5px",
                  marginBottom: "5px",
                  marginRight: "0",
                  marginLeft: "0",
                }}
              >
                <Col
                  style={{
                    margin: "auto",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  <h5 style={{ margin: "auto" }}>Other actions</h5>
                </Col>
              </Row>
              {manualLabels.phases
                .filter((d) => d.label === "Teamwork actions") // TODO: remove hardcoded value
                .map((d, i) => {
                  return (
                    <div key={i}>
                      <Row
                        style={{
                          marginBottom: "10px",
                          marginTop: "10px",
                          marginRight: "0",
                          marginLeft: "0",
                        }}
                      >
                        <Col
                          style={{
                            margin: "auto",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                          }}
                        >
                          <Button
                            key={d._id}
                            id={d._id}
                            variant="light"
                            size="md"
                            onClick={() => {
                              trackEvent({
                                action: "click",
                                element: `${d.label}KeyEventFilterButton`,
                                data: d,
                              });
                              setFilterKeyEvent(d._id);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              backgroundColor:
                                filterKeyEvent === d._id ? "#e1e6eb" : "",
                              borderColor:
                                filterKeyEvent === d._id ? "#e1e6eb" : "",
                            }}
                            active={filterKeyEvent === d._id}
                          >
                            {d.label}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
            </Container>
          </Col>
          <Col md={7}>
            <Container
              style={{
                padding: "2px",
                borderStyle: "solid",
                borderColor: "#CCCCCC",
                borderRadius: "15px",
                backgroundColor: "#F0F0F0",
                paddingBottom: "10px",
              }}
            >
              <h5 className="mx-2 my-2">Actions</h5>

              <Button
                variant="success"
                size="md"
                onClick={() => {
                  trackEvent({
                    action: "click",
                    element: "tagCustomActionButton",
                  });
                  handleCreateNoteModalShow();
                }}
                style={{
                  width: "95%",
                  fontWeight: "600",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              >
                Tag custom action +
              </Button>

              {manualLabels.actions
                .filter((d) => {
                  return (
                    d.phasesAssociated &&
                    d.phasesAssociated.includes(filterKeyEvent)
                  );
                })
                .map((d, i) => {
                  return (
                    <Button
                      key={i}
                      variant="light"
                      size="md"
                      onClick={() => {
                        trackEvent({
                          action: "click",
                          element: "submitCustomTagAction",
                          data: d.label,
                        });
                        addNote(d.label);
                      }}
                      style={{
                        width: "95%",
                        marginBottom: "5px",
                        marginTop: "5px",
                        textAlign: "left",
                      }}
                    >
                      <Row style={{ marginLeft: "0px", marginRight: "0px" }}>
                        <Col
                          xs="auto"
                          style={{
                            margin: "auto",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                          }}
                        >
                          <BsCircle
                            size="0.5em"
                            color={COLOURS.ACTION_ORANGE}
                          />
                        </Col>
                        <Col
                          style={{
                            margin: "auto",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                          }}
                        >
                          {d.label}
                        </Col>
                      </Row>
                    </Button>
                  );
                })}
            </Container>
          </Col>
        </Row>

        {/* Empty line so component is not sticking bottom of screen */}
        <br />
        <br />

        <Modal
          show={showCreateNoteModal}
          onHide={() => {
            trackEvent({
              action: "click",
              element: "closeCreateCustomNoteModal",
            });
            handleCreateNoteModalClose();
            // reset speech recognition memory when close
            resetTranscript();
            SpeechRecognition.stopListening();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create custom action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Form.Group controlId="label">
                <Form.Label>Action name:</Form.Label>
                <Row>
                  <Col
                    style={{
                      margin: "auto",
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="Enter Action"
                      value={label}
                      autoFocus
                      onChange={(e) => setLabel(e.target.value)}
                    />
                  </Col>
                  <Col
                    xs="auto"
                    style={{
                      margin: "auto",
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    {browserSupportsSpeechRecognition && listening ? (
                      <BsFillMicFill
                        style={{ color: "green" }}
                        size="1.5em"
                        onClick={() => {
                          trackEvent({
                            action: "click",
                            element: "microphoneButton",
                            data: "disable",
                          });
                          SpeechRecognition.stopListening();
                        }}
                      />
                    ) : (
                      <BsMicMuteFill
                        style={{ color: "red" }}
                        size="1.5em"
                        onClick={() => {
                          trackEvent({
                            action: "click",
                            element: "microphoneButton",
                            data: "enable",
                          });
                          SpeechRecognition.startListening({
                            continuous: true,
                          });
                        }}
                      />
                    )}
                  </Col>
                </Row>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "submitCustomTagActionButton",
                  data: label,
                });
                handleSubmit();
              }}
            >
              Tag action
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Track>
  );
};
export default PhaseButtons;
