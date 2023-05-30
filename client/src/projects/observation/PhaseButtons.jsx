import React, { useState } from "react";
import { Button, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { manualLabels, sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";
import { BsThreeDotsVertical } from "react-icons/bs";

const PhaseButtons = () => {
  const { observation, setNotes } = useObservation();

  const addNote = (label = "") => {
    const data = {
      message: label,
      timeString: new Date(Date.now()).toISOString(),
    };

    ObservationAPI.recordNote(observation._id, data).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    addNote(label);
    console.log("Submitted label: ", label);
    handleCreateNoteModalClose();
  };

  const [filterKeyEvent, setFilterKeyEvent] = useState("");

  return (
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
            <h5 className="mx-2 my-2"> Key events</h5>

            {manualLabels.phases.map((d, i) => {
              return (
                <div style={{}}>
                  <Row style={{ marginBottom: "5px", marginTop: "5px" }}>
                    <Col style={{ paddingLeft: "15px", paddingRight: "0px" }}>
                      <Button
                        key={d._id}
                        id={d._id}
                        variant="outline-danger"
                        size="md"
                        onClick={() => {
                          setFilterKeyEvent(d._id);
                          addNote(d.label);
                        }}
                        style={{
                          width: "100%",
                          color: "black",
                          borderWidth: "3px",
                          fontWeight: "700",
                        }}
                      >
                        {d.label}
                      </Button>
                    </Col>
                    <Col
                      xs="auto"
                      style={{ paddingLeft: "5px", paddingRight: "15px" }}
                    >
                      <Button
                        key={d._id}
                        id={d._id}
                        variant="outline-danger"
                        style={{
                          color: "black",
                          width: "100%",
                          borderWidth: "3px",
                        }}
                        onClick={() => {
                          setFilterKeyEvent(d._id);
                        }}
                      >
                        <BsThreeDotsVertical />
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
                handleCreateNoteModalShow();
              }}
              style={{
                width: "95%",
                fontWeight: "600",
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              Add new action +
            </Button>

            {manualLabels.actions
              .filter((d) => {
                // console.log("phasesAssociated:", d.phasesAssociated);
                // console.log("filterKeyEvent:", filterKeyEvent);
                return (
                  d.phasesAssociated &&
                  d.phasesAssociated.includes(filterKeyEvent)
                );
              })
              .map((d, i) => {
                return (
                  <Button
                    key={i}
                    variant="outline-primary"
                    size="md"
                    onClick={() => addNote(d.label)}
                    style={{
                      width: "95%",
                      marginBottom: "5px",
                      marginTop: "5px",
                      color: "black",
                      borderWidth: "3px",
                      fontWeight: "500",
                    }}
                  >
                    {d.label}
                  </Button>
                );
              })}
          </Container>
        </Col>
      </Row>

      <Modal show={showCreateNoteModal} onHide={handleCreateNoteModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create custom action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="label">
              <Form.Label>Action name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Action"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{ marginTop: "15px" }}
            >
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default PhaseButtons;
