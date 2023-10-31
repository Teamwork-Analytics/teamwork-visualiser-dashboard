/**
 * @file VisualisationInfoModal Component
 */

import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const VisualisationInfoModal = ({ infoDiv, show, handleClose, vizTitle }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{vizTitle || "Default Title"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{infoDiv || <p>No information available.</p>}</Modal.Body>
    </Modal>
  );
};

VisualisationInfoModal.propTypes = {
  infoDiv: PropTypes.node,
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  vizTitle: PropTypes.string,
};

export default VisualisationInfoModal;
