import { Modal, Button } from "react-bootstrap";
import DisplayViz from "../socketComponents/DisplayViz";

//image references:
import { SocialNetworkView, ENANetworkView } from "../../communication";
import TeamworkBarchart from "../../teamwork/TeamworkBarchart";
import HiveView from "../../hive/HiveView";
import { useTimeline } from "./TimelineContext";
import VideoVisualisation from "./VideoVisualisation";

const PreviewProjectionModal = ({
  showPreviewModal,
  handleClosePreviewModal,
  handleConfirmProjection,
  selectedVis,
}) => {
  const { range } = useTimeline();
  // duplicated - preview stuff
  const imageReferences = {
    commBehaviour: {
      size: "small",
      viz: <ENANetworkView />,
    },

    commNetwork: {
      size: "small",
      viz: <SocialNetworkView timeRange={range} />,
    },
    priorBar: {
      size: "small",
      viz: (
        <TeamworkBarchart
          style={{
            width: "auto",
            objectFit: "scale-down",
            maxHeight: "33vh",
          }}
          fluid
        />
      ),
    },
    wardMap: {
      size: "medium",
      viz: <HiveView timeRange={range} />,
    },
    video: {
      size: "large",
      viz: (
        <VideoVisualisation
          style={{
            width: "auto",
            objectFit: "scale-down",
            maxHeight: "33vh",
            minHeight: "30vh",
          }}
          isVideoTabActive={true}
          fluid
          timeRange={range}
        />
      ),
    },
  };

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
          <Modal.Title>Preview selected visualisations</Modal.Title>
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
              Send to screen
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
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
                  viz={imageReferences[d.id].viz}
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
