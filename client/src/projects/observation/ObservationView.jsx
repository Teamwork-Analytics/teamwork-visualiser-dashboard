import { useState } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DebriefingControllerModule from "./DebriefingControllerModule";
import ObservationTaggingModule from "./ObservationTaggingModule";
import { useObservation } from "./ObservationContext";
import ToolInPrep from "../../components/loadingComponents/ToolInPrep";

const ObservationView = () => {
  const { simulationId } = useParams();
  const { obsStartTime, obsEndTime } = useObservation();

  // const { observation } = useObservation();
  // const [state, setState] = useState({
  //   baselineTime: null,
  //   startTime: null,
  //   stopTime: null,
  // });

  // useEffect(() => {
  //   setState({ ...observation });
  // }, [observation]);

  const styles = {
    outer: {
      margin: "0 auto",
      width: "90vw",
      maxWidth: "1440px",
      height: "100%",
      colour: "white",
    },
    info: { width: "20vw", margin: "0 auto" },
  };

  // const timeString = (time) => {
  //   return time === null ? "-" : new Date(time).toLocaleString();
  // };

  // const AlertCondition = () => {
  //   let alertColour = "secondary";
  //   let message = "Baseline has started, but simulation hasn't started yet.";
  //   if (state.stopTime !== null) {
  //     alertColour = "success";
  //     message = "Simulation has stopped & is complete.";
  //   } else if (state.startTime !== null) {
  //     alertColour = "warning";
  //     message = "Simulation has started.";
  //   }

  //   return <Alert variant={alertColour}>{`${message}`}</Alert>;
  // };

  const [currentTab, setCurrentTab] = useState("observation");

  return (
    <div style={styles.outer}>
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
        onSelect={(k) => setCurrentTab(k)}
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
          eventKey="assessment"
          title="2. Team Assessment"
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
        <Tab
          eventKey="debriefing"
          title="3. Debriefing"
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
      </Tabs>
      <ReactTooltip />
    </div>
  );
};

export default ObservationView;
