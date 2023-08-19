import { useState } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DebriefingControllerModule from "./DebriefingControllerModule";
import { useObservation } from "./ObservationContext";
import ToolInPrep from "../../components/loadingComponents/ToolInPrep";
import { ArrowLeft } from "react-bootstrap-icons";
import { useTracking } from "react-tracking";
import { NurseNameProvider } from "./visualisationComponents/NurseNameContext";
import HiddenTool from "../../components/loadingComponents/HiddenTool";

const ObservationView = () => {
  const { simulationId } = useParams();
  const { obsStartTime, obsEndTime, toggleRefreshSim } = useObservation();
  const { Track, trackEvent } = useTracking({ page: "Observation" });
  const navigate = useNavigate();

  const styles = {
    outer: {
      position: "relative",
      margin: "0 auto",
      width: "90vw",
      maxWidth: "1440px",
      height: "100%",
      colour: "white",
    },
    backButton: {
      position: "absolute",
    },
    info: { width: "20vw", margin: "0 auto" },
  };

  const [currentTab, setCurrentTab] = useState("debriefing");

  return (
    <Track>
      <NurseNameProvider>
        <div style={styles.outer}>
          <div style={styles.backButton}>
            <ArrowLeft
              style={{ cursor: "pointer" }}
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "returnToMainPage",
                });
                navigate("/main");
              }}
              size={"30px"}
            />
          </div>

          <h1>Session {simulationId}</h1>
          <hr style={{ marginBottom: "0px" }} />
          <Tabs
            defaultActiveKey={currentTab}
            onSelect={(k) => {
              trackEvent({ action: "click", element: k + " Tab", data: k });
              toggleRefreshSim();
              return setCurrentTab(k);
            }}
            id="tagging-debriefing-switch"
            style={{ width: "100%", marginBottom: "0px" }}
            // @ts-ignore
            justify
            variant="pills"
          >
            <Tab
              eventKey="observation"
              title="1. Tagging"
              // style cant be used directly in Tab as its nested too deep
              tabAttrs={{
                style: currentTab === "observation" ? {} : { color: "black" },
              }}
            >
              <hr style={{ marginTop: "0px", marginBottom: "0px" }} />
              <Container style={{ display: "flex", minHeight: "60vh" }}>
                <HiddenTool />
              </Container>
            </Tab>

            <Tab
              eventKey="debriefing"
              title="2. Debriefing"
              tabAttrs={{
                style: currentTab === "debriefing" ? {} : { color: "black" },
              }}
            >
              <hr style={{ marginTop: "0px", marginBottom: "0px" }} />
              {obsStartTime && obsEndTime ? (
                <DebriefingControllerModule />
              ) : (
                <Container style={{ display: "flex", minHeight: "60vh" }}>
                  <ToolInPrep />
                </Container>
              )}
            </Tab>
            <Tab
              eventKey="assessment"
              title="3. Team Assessment"
              // style cant be used directly in Tab as its nested too deep
              tabAttrs={{
                style: currentTab === "assessment" ? {} : { color: "black" },
              }}
            >
              <hr style={{ marginTop: "0px", marginBottom: "0px" }} />
              <Container style={{ display: "flex", minHeight: "60vh" }}>
                <HiddenTool />
              </Container>
            </Tab>
          </Tabs>
          <ReactTooltip />
        </div>
      </NurseNameProvider>
    </Track>
  );
};

export default ObservationView;
