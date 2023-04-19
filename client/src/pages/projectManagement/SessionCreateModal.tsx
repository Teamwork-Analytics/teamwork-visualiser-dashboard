import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Project } from "../../types/ProjectProps";

interface SessionCreateModalProps {
  show: boolean;
  projects: Project[];
  handleClose: () => void;
  handleCreate: (
    sessionId: string,
    sessionName: string,
    projectId: string
  ) => void;
}

const SessionCreateModal: React.FC<SessionCreateModalProps> = ({
  show,
  projects,
  handleClose,
  handleCreate,
}) => {
  const [sessionId, setSessionId] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleCreate(sessionId, sessionName, projectId);
    setSessionId("");
    setSessionName("");
    setProjectId("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="sessionId">
            <Form.Label>Session ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="sessionName">
            <Form.Label>Session Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter session name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="projectId">
            <Form.Label>Associate Project</Form.Label>
            <Form.Control
              as="select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit">
            Create
          </Button>
          <Button variant="secondary" onClick={handleClose} className="ml-2">
            Cancel
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SessionCreateModal;
