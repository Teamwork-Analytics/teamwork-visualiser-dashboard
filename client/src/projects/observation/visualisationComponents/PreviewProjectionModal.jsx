import { Modal, Button } from "react-bootstrap";
import DisplayViz from "../socketComponents/DisplayViz";

//image references:
import priorBar from "../../../images/vis/prioritisation-bar.png";
import videoVis from "../../../images/vis/video.png";
import behaviourVis from "../../../images/vis/com-behaviour.png";
import communicationVis from "../../../images/vis/communication-network.png";
import mapVis from "../../../images/vis/ward-map.png";

// duplicated - preview stuff
const imageReferences = {
  commBehaviour: { size: "small", imageUrl: behaviourVis },
  commNetwork: { size: "small", imageUrl: communicationVis },
  priorBar: { size: "small", imageUrl: priorBar },
  wardMap: { size: "medium", imageUrl: mapVis },
  video: { size: "large", imageUrl: videoVis },
};

const PreviewProjectionModal = ({
  showPreviewModal,
  handleClosePreviewModal,
  handleConfirmProjection,
  selectedVis,
}) => {
  const decideSize = (d) => {
    if (selectedVis.length === 1 && d.id !== "videoVis") {
      return "single";
    }
    return imageReferences[d.id].size;
  };

  return (
    <>
      <Modal
        size="xl"
        show={showPreviewModal}
        onHide={handleClosePreviewModal}
        fullscreen={true}
      >
        <Modal.Header>
          <Modal.Title>Preview if you selected the visualisation</Modal.Title>
          <div>
            <Button
              variant="warning"
              style={{ fontSize: "12px", margin: "2px" }}
              onClick={handleClosePreviewModal}
            >
              Edit selection
            </Button>
            <Button
              variant="success"
              style={{ fontSize: "12px", margin: "2px" }}
              onClick={handleConfirmProjection}
            >
              Send to projector
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p
            style={{
              fontSize: "10px",
            }}
          >
            You have selected:
            {selectedVis && selectedVis.map((vis) => vis.id).join(", ")}
          </p>
          <div
            style={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              width: "100vw",
              height: "90vh",
              maxHeight: "90vh",
              flexWrap: "wrap",
            }}
          >
            {selectedVis.length !== 0 ? (
              selectedVis.map((d) => (
                <DisplayViz
                  size={decideSize(d)}
                  image={imageReferences[d.id].imageUrl}
                />
              ))
            ) : (
              <div align="center">
                <h1>🔍No visualisations</h1>
                <p>Please select up to three visualisations</p>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PreviewProjectionModal;
