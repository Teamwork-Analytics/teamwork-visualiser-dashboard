import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

interface EditProjectModalProps {
  show: boolean;
  projectId: string;
  projectName: string;
  handleClose: () => void;
  handleSave: (newProjectId: string, newProjectName: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  show,
  projectId,
  projectName,
  handleClose,
  handleSave,
}) => {
  const [newProjectId, setNewProjectId] = useState(projectId);
  const [newProjectName, setNewProjectName] = useState(projectName);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave(newProjectId, newProjectName);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="projectId">
            <Form.Label>Project ID</Form.Label>
            <Form.Control
              type="text"
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="projectName">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
          <Button variant="secondary" onClick={handleClose} className="ml-2">
            Cancel
          </Button>
          <Link to={`/edit-tagging/${projectId}`}>
            <Button variant="info" className="ml-2">
              Edit Project Tagging
            </Button>
          </Link>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectModal;
