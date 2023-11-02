// EditSessionModal.tsx
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Simulation } from "@interfaces/SimulationProps";

interface EditSessionModalProps {
  show: boolean;
  handleClose: () => void;
  simulation: Simulation;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
  show,
  handleClose,
  simulation,
}) => {
  const [sessionId, setSessionId] = useState(simulation.simulationId);
  const [sessionName, setSessionName] = useState(simulation.name);

  const handleSaveChanges = () => {
    // TODO: logic to save changes to session
    console.log("Saving changes...");
  };

  const handleDeleteSession = () => {
    // TODO: logic to delete session
    console.log("Deleting session...");
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSessionId">
            <Form.Label>Session ID</Form.Label>
            <Form.Control
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formSessionName">
            <Form.Label>Session Name</Form.Label>
            <Form.Control
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteSession}>
          Delete Session
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSessionModal;
