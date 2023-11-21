import { useState } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DebriefingControllerModule from "./DebriefingControllerModule";
import ObservationTaggingModule from "./ObservationTaggingModule";
import { useObservation } from "./ObservationContext";
import ToolInPrep from "src/shared/components/loadingComponents/ToolInPrep";
import { ArrowLeft } from "react-bootstrap-icons";
import { useTracking } from "react-tracking";
import { NurseNameProvider } from "./visualisationComponents/NurseNameContext";

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

  const [currentTab, setCurrentTab] = useState("observation");

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

          {/* TODO: code commented out below moved into sidebar (hide from researcher) */}
          {/* <div style={styles.info}>
          {observation.baselineTime !== null ? <AlertCondition /> : null}
          <label>Baseline time: {timeString(state.baselineTime)} </label>
          <br />
          <label>Start time: {timeString(state.startTime)} </label>
          <br />
          <label>Stop time: {timeString(state.stopTime)}</label>
        </div> */}
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
              <ObservationTaggingModule />
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
              <div style={{ width: "100%", height: "80vh" }}>
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdTYC_SXeUUka2WXpiH1Fglfz7KmEa86Ca-iM3pB5HnvolRCQ/viewform?embedded=true"
                  title="Team Assessment Google Form"
                  style={{ width: "100%", height: "100%" }}
                ></iframe>{" "}
              </div>
            </Tab>
          </Tabs>
          <ReactTooltip />
        </div>
      </NurseNameProvider>
    </Track>
  );
};

export default ObservationView;
