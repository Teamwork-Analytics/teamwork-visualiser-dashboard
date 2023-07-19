/**
 * @file VisualisationInfoModal Component
 */

import { Modal } from "react-bootstrap";

const VisualisationInfoModal = ({ infoDiv, show, handleClose, vizTitle }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{vizTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{infoDiv}</Modal.Body>
    </Modal>
  );
};

export default VisualisationInfoModal;
