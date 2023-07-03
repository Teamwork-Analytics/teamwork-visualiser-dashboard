import { useState, useEffect } from "react";
import { Row, Col, Tab, Tabs, Nav, Container, Button } from "react-bootstrap";

import { FaPlus, FaCheckSquare } from "react-icons/fa";
import { TimelineProvider } from "./visualisationComponents/TimelineContext";
import { socket } from "./socket";
import { ConnectionState } from "./socketComponents/ConnectionState";
import { ConnectionManager } from "./socketComponents/ConnectionManager";
import PreviewProjectionModal from "./visualisationComponents/PreviewProjectionModal";
import toast from "react-hot-toast";
import {
  topTabVisualisations,
  bottomLeftVisualisations,
  bottomRightVisualisations,
} from "./visualisationComponents/VisualisationsList";

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
  addVisButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 100,
    fontSize: "14px",
    padding: "5px",
  },
  bottomTabContainer: {
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "lightgrey",
    borderRadius: "10px",
    padding: "5px",
    minHeight: "34vh",
  },
};

const DebriefingControllerModule = () => {
  // socket connection
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

  // send selected Vis
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

  // send empty list
  const handleRevertAllProjections = () => {
    const toastId = toast.loading("Loading...");
    setSelectedVis([]);
    const sentJson = JSON.stringify([]);
    socket.emit("send-disp-list", sentJson, () => {
      console.log("Socket sent empty list to revert displays.");
    });
    toast.success("Reverted projections", {
      id: toastId,
    });
  };

  // tabs default active
  const [topActiveTab, setTopActiveTab] = useState("timeline");
  const [bottomLeftActiveTab, setBottomLeftActiveTab] = useState("priorBar");
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

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TimelineProvider>
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
              }}
            >
              <Tabs
                id="top-tabs"
                defaultActiveKey={topActiveTab}
                onSelect={(key) => {
                  setTopActiveTab(key);
                  setIsVideoTabActive(key === "video");
                }}
                variant="pills"
              >
                {topTabVisualisations.map((tab, index) => (
                  <Tab
                    key={index}
                    eventKey={tab.eventKey}
                    title={tab.title}
                    tabAttrs={{
                      style:
                        topActiveTab === tab.eventKey
                          ? debriefStyles.activeTab
                          : debriefStyles.inactiveTab,
                    }}
                    style={tab.tabStyle ? tab.tabStyle : null}
                  >
                    {tab.component(
                      debriefStyles.imageContainer,
                      isVideoTabActive
                    )}
                  </Tab>
                ))}
              </Tabs>
              <Button
                variant="success"
                style={{
                  ...debriefStyles.addVisButton,
                  opacity: selectedVis.some((vis) => vis.id === topActiveTab)
                    ? "0.65"
                    : "1",
                  display: isVideoTabActive ? "block" : "none", // button will be hidden when the video tab is not active
                }}
                onClick={() => handleAddVis(topActiveTab)}
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
        {/* Bottom row viz */}
        <Row style={{ minHeight: "35vh", marginTop: "5px" }}>
          {/* Bottom left viz */}
          <Col
            lg={6}
            style={{
              padding: "1px",
              marginRight: "5px",
            }}
          >
            <Container style={debriefStyles.bottomTabContainer}>
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
                      {bottomLeftVisualisations.map((tab, index) => (
                        <Nav.Item key={index}>
                          <Nav.Link
                            eventKey={tab.eventKey}
                            style={
                              bottomLeftActiveTab === tab.eventKey
                                ? debriefStyles.activeTab
                                : debriefStyles.inactiveTab
                            }
                          >
                            {tab.title}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
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
                      {bottomLeftVisualisations.map((tab, index) => (
                        <Tab.Pane eventKey={tab.eventKey} key={index}>
                          {tab.component()}
                        </Tab.Pane>
                      ))}
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

          {/* Bottom right viz */}
          <Col style={{ padding: "1px", marginLeft: "5px" }}>
            <Container style={debriefStyles.bottomTabContainer}>
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
                      {bottomRightVisualisations.map((tab, index) => (
                        <Nav.Item key={index}>
                          <Nav.Link
                            eventKey={tab.eventKey}
                            style={
                              bottomRightActiveTab === tab.eventKey
                                ? debriefStyles.activeTab
                                : debriefStyles.inactiveTab
                            }
                          >
                            {tab.title}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
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
                      {bottomRightVisualisations.map((tab, index) => (
                        <Tab.Pane eventKey={tab.eventKey} key={index}>
                          {tab.component()}
                        </Tab.Pane>
                      ))}
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
      <ConnectionState isConnected={isConnected} />
      {!hideConnectButton && <ConnectionManager />}
    </div>
  );
};

export default DebriefingControllerModule;
