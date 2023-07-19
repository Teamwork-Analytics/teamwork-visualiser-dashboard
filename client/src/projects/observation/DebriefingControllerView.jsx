import { useState } from "react";
import {
  Row,
  Col,
  Tab,
  Container,
  Button,
  ButtonGroup,
  ModalTitle,
} from "react-bootstrap";

import { FaPlus, FaCheckSquare } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import { useTimeline } from "./visualisationComponents/TimelineContext";
import { socket } from "./socket";
import PreviewProjectionModal from "./visualisationComponents/PreviewProjectionModal";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  topTabVisualisations,
  bottomLeftVisualisations,
  bottomRightVisualisations,
} from "./visualisationComponents/VisualisationsList";
import { prepareData } from "../../utils/socketUtils";
import VisualisationInfoModal from "./visualisationComponents/VisualisationInfoModal";

const debriefStyles = {
  activeTab: {
    backgroundColor: "white",
    color: "black",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "lightgrey",
    borderRadius: "0.25rem",
    fontSize: "14px",
    padding: "5px",
  },
  inactiveTab: { color: "gray", fontSize: "14px", padding: "5px" },
  addVisButton: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    fontSize: "14px",
    padding: "5px",
    // width: "80%",
    whiteSpace: "nowrap",
  },
  bottomTabContainer: {
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "lightgrey",
    borderRadius: "10px",
    padding: "5px",
    minHeight: "34vh",
    backgroundColor: "white",
    height: "100%",
  },
};

const DebriefingControllerView = () => {
  const { simulationId } = useParams();
  const { range } = useTimeline();

  // send selected Vis
  const handleConfirmProjection = () => {
    console.log(selectedVis);
    const preparedData = prepareData(range, selectedVis, simulationId);
    socket.emit("send-disp-list", preparedData, () => {
      console.log(
        "Socket sent selected displays to server in a form of a list."
      );
    });
    setShowPreviewModal(false);
    setSelectedVis([]);
  };

  // send empty list
  const handleRevertAllProjections = () => {
    const toastId = toast.loading("Loading...");
    setSelectedVis([]);
    const preparedData = prepareData(range, [], simulationId);
    socket.emit("send-disp-list", preparedData, () => {
      console.log("Socket sent empty list to revert displays.");
    });
    toast.success("Clear selections", {
      id: toastId,
    });
  };

  // tabs default active
  const [topActiveTab, setTopActiveTab] = useState("timeline");
  const [bottomLeftActiveTab, setBottomLeftActiveTab] = useState("wardMap");
  const [bottomRightActiveTab, setBottomRightActiveTab] =
    useState("commNetwork");

  // visualisations selection
  const [selectedVis, setSelectedVis] = useState([]);
  const handleAddVis = (id) => {
    if (!selectedVis.some((item) => item.id === id) && selectedVis.length < 3) {
      setSelectedVis([...selectedVis, { id: id }]);
    } else if (selectedVis.some((item) => item.id === id)) {
      setSelectedVis(selectedVis.filter((item) => item.id !== id));
    } else if (selectedVis.length >= 3) {
      alert("You've already selected the maximum of 3 visualisations.");
    } else {
      alert("Something went wrong.");
    }
  };

  // preview modal before projection
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const handleClosePreviewModal = () => setShowPreviewModal(false);

  const [isVideoTabActive, setIsVideoTabActive] = useState(false);

  // component for bottom two tabs group
  const BottomVizTabContainer = ({
    visualisations,
    activeTab,
    setActiveTab,
    title,
  }) => {
    // info modal handler for each visualisation
    const [infoModalContent, setInfoModalContent] = useState(null);
    const [infoModalTitle, setInfoModalTitle] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const handleInfoClose = () => {
      setShowInfoModal(false);
      setInfoModalTitle(null);
      setInfoModalContent(null);
    };
    const handleInfoShow = (title, infoContent) => {
      setInfoModalTitle(title);
      setInfoModalContent(infoContent);
      setShowInfoModal(true);
    };

    return (
      <Container style={debriefStyles.bottomTabContainer}>
        <VisualisationInfoModal
          infoDiv={infoModalContent}
          show={showInfoModal}
          handleClose={handleInfoClose}
          vizTitle={infoModalTitle}
        />
        <Tab.Container activeKey={activeTab}>
          <h4 style={{ color: "grey" }}>{title}</h4>

          <Row style={{ marginRight: "0", marginLeft: "0" }}>
            <Col
              sm={3}
              style={{
                paddingLeft: "5px",
                paddingRight: "5px",
                position: "relative",
              }}
            >
              <ButtonGroup vertical={true} aria-label="Tab label">
                {visualisations.map((tab, index) => (
                  <Button
                    key={index}
                    variant={
                      activeTab === tab.eventKey
                        ? "secondary"
                        : "outline-secondary"
                    }
                    onClick={() => setActiveTab(tab.eventKey)}
                    style={{ fontSize: "14px" }}
                  >
                    {tab.title}
                  </Button>
                ))}
              </ButtonGroup>
              <Button
                variant="success"
                style={{
                  ...debriefStyles.addVisButton,
                  opacity: selectedVis.some((vis) => vis.id === activeTab)
                    ? "0.65"
                    : "1",
                }}
                onClick={() => handleAddVis(activeTab)}
              >
                {selectedVis.some((vis) => vis.id === activeTab) ? (
                  <>
                    <FaCheckSquare style={{ marginBottom: "2px" }} /> Added
                  </>
                ) : (
                  <>
                    <FaPlus style={{ marginBottom: "2px" }} /> Add to preview
                  </>
                )}
              </Button>
            </Col>
            <Col sm={9} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
              <Tab.Content style={{ position: "relative" }}>
                {visualisations.map((tab, index) => (
                  <Tab.Pane eventKey={tab.eventKey} key={index}>
                    <BsInfoCircle
                      style={{
                        zIndex: "100",
                        position: "absolute",
                        top: "-20",
                        right: "20",
                      }}
                      onClick={() => {
                        handleInfoShow(tab.title, tab.info());
                      }}
                    />

                    {tab.component()}
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    );
  };

  return (
    <>
      <PreviewProjectionModal
        showPreviewModal={showPreviewModal}
        handleClosePreviewModal={handleClosePreviewModal}
        handleConfirmProjection={handleConfirmProjection}
        selectedVis={selectedVis}
      />
      {/* Row to show selected list and projection control buttons */}
      <Row style={{ margin: "3px", fontSize: "14px" }}>
        <Col
          className="d-flex align-items-center text-left"
          style={{ fontSize: "12px" }}
        >
          You have selected visualisations:{" "}
          {selectedVis.map((vis) => vis.id).join(", ")}
        </Col>
        <Col className="d-flex justify-content-end text-right">
          <Button
            variant="danger"
            style={{ marginRight: "5px", fontSize: "14px" }}
            onClick={handleRevertAllProjections}
          >
            Clear selections
          </Button>
          <Button
            variant="success"
            style={{ marginRight: "5px", fontSize: "14px" }}
            onClick={() => {
              setIsVideoTabActive(false);
              setShowPreviewModal(true);
            }}
          >
            Projection preview
          </Button>
        </Col>
      </Row>
      {/* Top row viz */}
      <Row style={{ minHeight: "35vh" }}>
        <Col style={{ padding: "1px" }}>
          <Container
            style={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: "lightgrey",
              borderRadius: "10px",
              padding: "5px",
              minHeight: "34vh",
              width: "100%",
              maxWidth: "100%",
              position: "relative",
              backgroundColor: "white",
            }}
          >
            <Tab.Container activeKey={topActiveTab}>
              <Row style={{ marginBottom: "5px" }}>
                <Col xs="auto">
                  <ButtonGroup aria-label="Top area tab label">
                    {topTabVisualisations(range).map((tab, index) => (
                      <Button
                        key={index}
                        variant={
                          topActiveTab === tab.eventKey
                            ? "secondary"
                            : "outline-secondary"
                        }
                        onClick={() => {
                          setTopActiveTab(tab.eventKey);
                          setIsVideoTabActive(tab.eventKey === "video");
                        }}
                        style={{ fontSize: "14px" }}
                      >
                        {tab.title}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Col>
              </Row>
              <Row>
                <Tab.Content style={{ position: "relative" }}>
                  {topTabVisualisations(range).map((tab, index) => (
                    <Tab.Pane eventKey={tab.eventKey} key={index}>
                      {tab.component(
                        debriefStyles.imageContainer,
                        isVideoTabActive
                      )}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Row>
              <Button
                variant="success"
                style={{
                  ...debriefStyles.addVisButton,
                  opacity: selectedVis.some((vis) => vis.id === topActiveTab)
                    ? "0.65"
                    : "1",
                  display: topActiveTab === "video" ? "block" : "none", // button will be hidden when the video tab is not active
                }}
                onClick={() => handleAddVis(topActiveTab)}
              >
                {selectedVis.some((vis) => vis.id === "video") ? (
                  <>
                    <FaCheckSquare style={{ marginBottom: "2px" }} /> Added
                  </>
                ) : (
                  <>
                    <FaPlus style={{ marginBottom: "2px" }} /> Add to preview
                  </>
                )}
              </Button>
            </Tab.Container>
          </Container>
        </Col>
      </Row>
      {/* Bottom row viz */}
      <Row style={{ minHeight: "35vh", marginTop: "5px" }}>
        {/* Bottom left viz */}
        <Col lg={6} style={{ padding: "1px", marginRight: "5px" }}>
          <BottomVizTabContainer
            title={"Space Utilisation"}
            visualisations={bottomLeftVisualisations(range)}
            activeTab={bottomLeftActiveTab}
            setActiveTab={setBottomLeftActiveTab}
          />
        </Col>

        {/* Bottom right viz */}
        <Col style={{ padding: "1px", marginLeft: "5px" }}>
          <BottomVizTabContainer
            title={"Team Communication"}
            visualisations={bottomRightVisualisations(range)}
            activeTab={bottomRightActiveTab}
            setActiveTab={setBottomRightActiveTab}
          />
        </Col>
      </Row>
    </>
  );
};

export default DebriefingControllerView;
