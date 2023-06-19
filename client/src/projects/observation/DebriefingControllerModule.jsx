import { useState } from "react";
import {
  Row,
  Col,
  Tab,
  Tabs,
  Nav,
  Container,
  Image,
  Button,
} from "react-bootstrap";
import TimelineVisualisation from "./visualisationComponents/TimelineVisualisation";

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
import { TimelineProvider } from "./visualisationComponents/TimelineContext";

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
};

const DebriefingControllerModule = () => {
  const [topActiveTab, setTopActiveTab] = useState("timeline");
  const [bottomLeftActiveTab, setBottomLeftActiveTab] = useState("priorBar");
  const [bottomRightActiveTab, setBottomRightActiveTab] =
    useState("commNetwork");

  const [selectedVis, setSelectedVis] = useState([]);
  const handleAddVis = (id) => {
    console.log(id);
    if (!selectedVis.includes(id) && selectedVis.length < 3) {
      setSelectedVis([...selectedVis, id]);
    } else {
      alert(
        "You're selecting same vis or you've already selected the maximum of 3 visualisations."
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Row style={{ margin: "3px", fontSize: "14px" }}>
        <Col className="d-flex align-items-center text-left">
          You have selected visualisations: {selectedVis.join(", ")}
        </Col>
        <Col className="d-flex justify-content-end text-right">
          <Button
            variant="success"
            style={{ marginRight: "5px", fontSize: "14px" }}
          >
            Project preview
          </Button>
          <Button
            variant="danger"
            style={{ marginRight: "5px", fontSize: "14px" }}
          >
            Revert all projections
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
                <TimelineProvider>
                  <TimelineVisualisation style={debriefStyles.imageContainer} />
                </TimelineProvider>
                <Image
                  src={dandelionTimeline}
                  style={debriefStyles.imageContainer}
                  fluid
                />
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
              variant="info"
              style={{
                position: "absolute",
                bottom: "10px",
                zIndex: 100,
                marginLeft: "-70px",
                fontSize: "14px",
                padding: "5px",
              }}
              onClick={() => handleAddVis(topActiveTab)}
              disabled={selectedVis.includes(topActiveTab)}
            >
              {selectedVis.includes(topActiveTab)
                ? "Added"
                : "Add visualisation"}
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
                      variant="info"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        zIndex: 100,
                        marginLeft: "-70px",
                        fontSize: "14px",
                        padding: "5px",
                      }}
                      onClick={() => handleAddVis(bottomLeftActiveTab)}
                      disabled={selectedVis.includes(bottomLeftActiveTab)}
                    >
                      {selectedVis.includes(bottomLeftActiveTab)
                        ? "Added"
                        : "Add visualisation"}
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
                    <Tab.Pane eventKey="calloutCount">
                      <Image
                        src={calloutCount}
                        style={debriefStyles.imageContainer}
                        fluid
                      />
                    </Tab.Pane>
                    <Button
                      variant="info"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        zIndex: 100,
                        marginLeft: "-70px",
                        fontSize: "14px",
                        padding: "5px",
                      }}
                      onClick={() => handleAddVis(bottomRightActiveTab)}
                      disabled={selectedVis.includes(bottomRightActiveTab)}
                    >
                      {selectedVis.includes(bottomRightActiveTab)
                        ? "Added"
                        : "Add visualisation"}
                    </Button>
                  </Tab.Content>
                </Col>
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
                    <Nav.Item>
                      <Nav.Link
                        eventKey="calloutCount"
                        style={
                          bottomRightActiveTab === "calloutCount"
                            ? debriefStyles.activeTab
                            : debriefStyles.inactiveTab
                        }
                      >
                        Callout Count
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
              </Row>
            </Tab.Container>
          </Container>
        </Col>
      </Row>
    </div>
  );
};

export default DebriefingControllerModule;
