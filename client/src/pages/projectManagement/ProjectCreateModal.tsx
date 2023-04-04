import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface ProjectCreateModalProps {
  show: boolean;
  handleClose: () => void;
  handleCreate: (name: string, projectId: string) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  show,
  handleClose,
  handleCreate,
}) => {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleCreate(name, projectId);
    setName("");
    setProjectId("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="projectName">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="projectId">
            <Form.Label>Project ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit">
          Create
        </Button>
        <Button variant="secondary" onClick={handleClose} className="ml-2">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectCreateModal;
