/**
 * @file PreviewProjectionModal Component
 *
 * @description This component renders a fullscreen modal for previewing selected visualisations
 * before they are sent to the screen. Component uses the TimelineContext to get the current
 * time range for the visualisations.
 *
 * @props
 *  - showPreviewModal: Boolean controlling whether the modal is open.
 *  - handleClosePreviewModal: Function to close the modal.
 *  - handleConfirmProjection: Function to confirm the selection and send the visualisations to the screen.
 *  - selectedVis: Array of selected visualisation data to be displayed.
 */

//image references:
import { Modal, Button } from "react-bootstrap";

import DisplayViz from "@components/displays/DisplayViz";
import { useTimeline } from "./TimelineContext";
import { useTracking } from "react-tracking";

const PreviewProjectionModal = ({
  showPreviewModal,
  handleClosePreviewModal,
  handleConfirmProjection,
  selectedVis,
}) => {
  const { Track, trackEvent } = useTracking({ page: "Debriefing" });
  // Get the current time range from the TimelineContext
  const { range } = useTimeline();

  return (
    <Modal
      size="xl"
      show={showPreviewModal}
      onHide={handleClosePreviewModal}
      fullscreen={true}
    >
      <Track>
        <Modal.Header>
          <Modal.Title>Preview selected visualisations</Modal.Title>
          <div>
            <Button
              variant="warning"
              style={{ fontSize: "12px", margin: "2px" }}
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "editSelectionInPreviewModal",
                });
                handleClosePreviewModal();
              }}
            >
              Edit selection
            </Button>
            <Button
              variant="success"
              style={{ fontSize: "12px", margin: "2px" }}
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "confirmProjectionInPreviewModal",
                  data: selectedVis.map((vis) => vis.name),
                });
                handleConfirmProjection();
              }}
            >
              Send to screen
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              alignContent: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              maxHeight: "90vh",
              flexWrap: "wrap",
            }}
          >
            {/* Render the selected visualisations with the current time range */}
            <DisplayViz selectedVis={selectedVis} range={range} />
          </div>
        </Modal.Body>
      </Track>
    </Modal>
  );
};

export default PreviewProjectionModal;
