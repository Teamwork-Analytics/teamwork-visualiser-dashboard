import { useState } from "react";
import {
  Row,
  Col,
  Tab,
  Container,
  Button,
  ButtonGroup,
  Card,
} from "react-bootstrap";

import { FaCheckSquare, FaSquare } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import { useTimeline } from "./visualisationComponents/TimelineContext";
import { socket } from "./socket";
import PreviewProjectionModal from "./visualisationComponents/PreviewProjectionModal";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  topTabVisualisations,
  bottomVisualisations,
} from "./visualisationComponents/VisualisationsList";
import { prepareData } from "../../utils/socketUtils";
import VisualisationInfoModal from "./visualisationComponents/VisualisationInfoModal";
import NurseNameBadges from "./visualisationComponents/NurseNameBadges";

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
    fontSize: "13px",
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
    toast.success("Visualisations projected to the screen.");
  };

  // send empty list
  const handleRevertAllProjections = () => {
    const toastId = toast.loading("Loading...");
    // setSelectedVis([]);
    const preparedData = prepareData(range, [], simulationId);
    socket.emit("send-disp-list", preparedData, () => {
      console.log("Socket sent empty list to revert displays.");
    });
    toast.success("Sharing stopped", {
      id: toastId,
    });
  };

  // tabs default active
  const [topActiveTab, setTopActiveTab] = useState("timeline");
  const [bottomActiveKey, setBottomActiveKey] = useState("wardMap");

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
    <>
      <VisualisationInfoModal
        infoDiv={infoModalContent}
        show={showInfoModal}
        handleClose={handleInfoClose}
        vizTitle={infoModalTitle}
      />
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
          <NurseNameBadges />
          {/* You have selected visualisations:{" "}
          {selectedVis.map((vis) => vis.id).join(", ")} */}
        </Col>
        <Col className="d-flex justify-content-end text-right" xs="auto">
          <Button
            variant="danger"
            style={{ marginRight: "5px", fontSize: "14px" }}
            onClick={handleRevertAllProjections}
          >
            Stop sharing
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
                            ? "dark"
                            : "outline-dark"
                        }
                        onClick={() => {
                          setTopActiveTab(tab.eventKey);
                          setIsVideoTabActive(tab.eventKey === "video");
                        }}
                        style={{
                          fontSize: "14px",
                        }}
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
                variant={
                  selectedVis.some((vis) => vis.id === topActiveTab)
                    ? "danger"
                    : "success"
                }
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
                    <FaCheckSquare style={{ marginBottom: "2px" }} /> Remove
                    from preview
                  </>
                ) : (
                  <>
                    <FaSquare style={{ marginBottom: "2px" }} /> Add to preview
                  </>
                )}
              </Button>
            </Tab.Container>
          </Container>
        </Col>
      </Row>
      {/* Bottom row viz */}
      <Row style={{ minHeight: "35vh", marginTop: "5px" }}>
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
            <div
              className="scrollable-div"
              style={{
                display: "flex",
                overflowX: "auto",
                whiteSpace: "nowrap",
                marginBottom: "5px",
              }}
            >
              {bottomVisualisations(range, showPreviewModal).map((tab, index) => (
                <>
                  <Card style={{ minWidth: "25rem", position: "relative" }}>
                    <BsInfoCircle
                      style={{
                        zIndex: "100",
                        position: "absolute",
                        top: "5",
                        right: "5",
                      }}
                      onClick={() => {
                        handleInfoShow(tab.title, tab.info());
                      }}
                    />
                    <Container style={{ margin: "5px" }}>
                      {tab.component()}
                    </Container>
                    <Card.Body>
                      <Card.Title
                        style={{
                          textAlign: "start",
                          marginTop: "15px",
                          marginBottom: "15px",
                        }}
                      >
                        {tab.title}
                      </Card.Title>

                      <Button
                        variant={
                          selectedVis.some((vis) => vis.id === tab.eventKey)
                            ? "danger"
                            : "success"
                        }
                        style={{
                          ...debriefStyles.addVisButton,
                        }}
                        onClick={() => handleAddVis(tab.eventKey)}
                      >
                        {selectedVis.some((vis) => vis.id === tab.eventKey) ? (
                          <>
                            <FaCheckSquare style={{ marginBottom: "2px" }} />{" "}
                            Remove from preview
                          </>
                        ) : (
                          <>
                            <FaSquare style={{ marginBottom: "2px" }} /> Add to
                            preview
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                  <div
                    key={index}
                    onClick={() => {
                      setBottomActiveKey(tab.eventKey);
                    }}
                    style={{
                      display: "inline-block",
                      fontSize: "14px",
                      color:
                        bottomActiveKey === tab.eventKey
                          ? "white"
                          : "rgb(33, 37, 41)",
                      marginRight: "5px",
                    }}
                  ></div>
                </>
              ))}
            </div>
          </Container>
        </Col>
      </Row>
    </>
  );
};

export default DebriefingControllerView;
