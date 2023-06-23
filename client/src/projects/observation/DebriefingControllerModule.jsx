import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Tab,
  Tabs,
  Nav,
  Container,
  Image,
  Button,
  Modal,
} from "react-bootstrap";
import TimelineVisualisation from "./visualisationComponents/TimelineVisualisation";
import { FaPlus, FaCheckSquare } from "react-icons/fa";
import { TimelineProvider } from "./visualisationComponents/TimelineContext";
import { socket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import DisplayViz from "./socketComponents/DisplayViz";

//image references:
import actionNetwork from "../../images/vis/action-network.png";
import calloutCount from "../../images/vis/callout-count.png";
import comBehaviour from "../../images/vis/com-behaviour.png";
import comNetwork from "../../images/vis/communication-network.png";
import dandelionTimeline from "../../images/vis/dandelion-timeline.png";
import keywordVis from "../../images/vis/keyword.png";
import priorBar from "../../images/vis/prioritisation-bar.png";
import studentAct from "../../images/vis/student-actions.png";
import videoVis from "../../images/vis/video.png";
import wardMap from "../../images/vis/ward-map.png";
import samplePreview from "../../images/sample-preview.png";

import behaviourVis from "../../images/vis/com-behaviour.png";
import communicationVis from "../../images/vis/communication-network.png";
import mapVis from "../../images/vis/ward-map.png";
import { set } from "date-fns";

// remember to change the css file as well for the styling of bottom two tabs group
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
  imageContainer: {
    width: "auto",
    objectFit: "scale-down",
    maxHeight: "33vh",
  },
  addVisButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 100,
    fontSize: "14px",
    padding: "5px",
  },
};

const DebriefingControllerModule = () => {
  // from socket io poc repo
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Connected to " + socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from " + socket.id);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const hideConnectButton = true;

  const handleConfirmProjection = () => {
    console.log(selectedVis);
    //['video', 'priorBar', 'commNetwork']
    const sentJson = JSON.stringify(selectedVis);
    socket.emit("send-disp-list", sentJson, () => {
      console.log(
        "Socket sent selected displays to server in a form of a list."
      );
    });
    setShowPreviewModal(false);
    setSelectedVis([]);
  };

  const handleRevertAllProjections = () => {
    setSelectedVis([]);
    const sentJson = JSON.stringify([]);
    socket.emit("send-disp-list", sentJson, () => {
      console.log("Socket sent empty list to revert displays.");
    });
  };

  const [topActiveTab, setTopActiveTab] = useState("timeline");
  const [bottomLeftActiveTab, setBottomLeftActiveTab] = useState("priorBar");
  const [bottomRightActiveTab, setBottomRightActiveTab] =
    useState("commNetwork");

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

  // duplicated - preview stuff
  const imageReferences = {
    commBehaviour: { size: "small", imageUrl: behaviourVis },
    commNetwork: { size: "small", imageUrl: communicationVis },
    priorBar: { size: "small", imageUrl: priorBar },
    wardMap: { size: "medium", imageUrl: mapVis },
    video: { size: "large", imageUrl: videoVis },
    // circleENA: {
    //   size: "small",
    //   imageUrl: circleENA,
    // },
  };

  const decideSize = (d) => {
    if (selectedVis.length === 1 && d.id !== "videoVis") {
      return "single";
    }
    return imageReferences[d.id].size;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ConnectionState isConnected={isConnected} />
      {!hideConnectButton && <ConnectionManager />}
      <TimelineProvider>
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
              {selectedVis.map((vis) => vis.id).join(", ")}
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

        <Row style={{ margin: "3px", fontSize: "14px" }}>
          <Col className="d-flex align-items-center text-left">
            You have selected visualisations:{" "}
            {selectedVis.map((vis) => vis.id).join(", ")}
          </Col>
          <Col className="d-flex justify-content-end text-right">
            <Button
              variant="danger"
              style={{ marginRight: "5px", fontSize: "14px" }}
              onClick={handleRevertAllProjections}
            >
              Revert all projections
            </Button>
            <Button
              variant="success"
              style={{ marginRight: "5px", fontSize: "14px" }}
              onClick={() => setShowPreviewModal(true)}
            >
              Projection preview
            </Button>
          </Col>
        </Row>
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
              }}
            >
              <Tabs
                id="top-tabs"
                defaultActiveKey={topActiveTab}
                onSelect={(key) => setTopActiveTab(key)}
                variant="pills"
              >
                <Tab
                  eventKey="timeline"
                  title="Timeline"
                  tabAttrs={{
                    style:
                      topActiveTab === "timeline"
                        ? debriefStyles.activeTab
                        : debriefStyles.inactiveTab,
                  }}
                >
                  <TimelineVisualisation style={debriefStyles.imageContainer} />
                </Tab>
                <Tab
                  eventKey="video"
                  title="Video"
                  tabAttrs={{
                    style:
                      topActiveTab === "video"
                        ? debriefStyles.activeTab
                        : debriefStyles.inactiveTab,
                  }}
                >
                  <Image
                    src={videoVis}
                    style={debriefStyles.imageContainer}
                    fluid
                  />
                </Tab>
              </Tabs>
              <Button
                variant="success"
                style={{
                  ...debriefStyles.addVisButton,
                  opacity: selectedVis.some((vis) => vis.id === "video")
                    ? "0.65"
                    : "1",
                }}
                onClick={() => handleAddVis("video")}
              >
                {selectedVis.some((vis) => vis.id === "video") ? (
                  <>
                    <FaCheckSquare style={{ marginBottom: "2px" }} /> Added
                  </>
                ) : (
                  <>
                    <FaPlus style={{ marginBottom: "2px" }} /> Add video
                  </>
                )}
              </Button>
            </Container>
          </Col>
        </Row>
        <Row style={{ minHeight: "35vh" }}>
          <Col
            lg={6}
            style={{
              padding: "1px",
            }}
          >
            <Container
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: "lightgrey",
                borderRadius: "10px",
                padding: "5px",
                minHeight: "34vh",
              }}
            >
              <Tab.Container
                id="bottom-left-tabs"
                defaultActiveKey={bottomLeftActiveTab}
                onSelect={(key) => setBottomLeftActiveTab(key)}
              >
                <Row style={{ marginRight: "0", marginLeft: "0" }}>
                  <Col
                    sm={3}
                    style={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link
                          eventKey="priorBar"
                          style={
                            bottomLeftActiveTab === "priorBar"
                              ? debriefStyles.activeTab
                              : debriefStyles.inactiveTab
                          }
                        >
                          Prioritisation Bar
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="wardMap"
                          style={
                            bottomLeftActiveTab === "wardMap"
                              ? debriefStyles.activeTab
                              : debriefStyles.inactiveTab
                          }
                        >
                          Ward Map
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col
                    sm={9}
                    style={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    <Tab.Content style={{ position: "relative" }}>
                      <Tab.Pane eventKey="priorBar">
                        <Image
                          src={priorBar}
                          style={debriefStyles.imageContainer}
                          fluid
                        />
                      </Tab.Pane>
                      <Tab.Pane eventKey="wardMap">
                        <Image
                          src={wardMap}
                          style={debriefStyles.imageContainer}
                          fluid
                        />
                      </Tab.Pane>
                      <Button
                        variant="success"
                        style={{
                          ...debriefStyles.addVisButton,
                          opacity: selectedVis.some(
                            (vis) => vis.id === bottomLeftActiveTab
                          )
                            ? "0.65"
                            : "1",
                        }}
                        onClick={() => handleAddVis(bottomLeftActiveTab)}
                      >
                        {selectedVis.some(
                          (vis) => vis.id === bottomLeftActiveTab
                        ) ? (
                          <>
                            <FaCheckSquare style={{ marginBottom: "2px" }} />{" "}
                            Added
                          </>
                        ) : (
                          <>
                            <FaPlus style={{ marginBottom: "2px" }} /> Add to
                            projection
                          </>
                        )}
                      </Button>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Container>
          </Col>
          <Col style={{ padding: "1px" }}>
            <Container
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: "lightgrey",
                borderRadius: "10px",
                padding: "5px",
                minHeight: "34vh",
              }}
            >
              <Tab.Container
                id="bottom-right-tabs"
                defaultActiveKey={bottomRightActiveTab}
                onSelect={(key) => setBottomRightActiveTab(key)}
              >
                <Row style={{ marginRight: "0", marginLeft: "0" }}>
                  <Col
                    sm={3}
                    style={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link
                          eventKey="commNetwork"
                          style={
                            bottomRightActiveTab === "commNetwork"
                              ? debriefStyles.activeTab
                              : debriefStyles.inactiveTab
                          }
                        >
                          Communication Network
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="commBehaviour"
                          style={
                            bottomRightActiveTab === "commBehaviour"
                              ? debriefStyles.activeTab
                              : debriefStyles.inactiveTab
                          }
                        >
                          Communication Behaviour
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col
                    sm={9}
                    style={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                    }}
                  >
                    <Tab.Content style={{ position: "relative" }}>
                      <Tab.Pane eventKey="commNetwork">
                        <Image
                          src={comNetwork}
                          style={debriefStyles.imageContainer}
                          fluid
                        />
                      </Tab.Pane>
                      <Tab.Pane eventKey="commBehaviour">
                        <Image
                          src={comBehaviour}
                          style={debriefStyles.imageContainer}
                          fluid
                        />
                      </Tab.Pane>

                      <Button
                        variant="success"
                        style={{
                          ...debriefStyles.addVisButton,
                          opacity: selectedVis.some(
                            (vis) => vis.id === bottomRightActiveTab
                          )
                            ? "0.65"
                            : "1",
                        }}
                        onClick={() => handleAddVis(bottomRightActiveTab)}
                      >
                        {selectedVis.some(
                          (vis) => vis.id === bottomRightActiveTab
                        ) ? (
                          <>
                            <FaCheckSquare style={{ marginBottom: "2px" }} />{" "}
                            Added
                          </>
                        ) : (
                          <>
                            <FaPlus style={{ marginBottom: "2px" }} /> Add to
                            projection
                          </>
                        )}
                      </Button>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Container>
          </Col>
        </Row>
      </TimelineProvider>
    </div>
  );
};

export default DebriefingControllerModule;
