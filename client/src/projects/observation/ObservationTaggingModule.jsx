import { Row, Col } from "react-bootstrap";
import PhaseButtons from "./PhaseButtons";
import Phases from "./Phases";
import NurseNameBadges from "./visualisationComponents/NurseNameBadges";
import DurationStopwatch from "./visualisationComponents/DurationStopwatch";
import { useState, useMemo } from "react";

const ObservationTaggingModule = () => {
  // Initialize methods using useMemo to avoid unnecessary re-renders
  const initialMethods = useMemo(
    () => ({ start: () => {}, pause: () => {} }),
    []
  );

  // lift up start pause control from DurationStopwatch component
  const [control, setControl] = useState(initialMethods);

  const handleReady = (methods) => {
    // Using callback form of setState to ensure we're always working with the most recent state
    setControl((prevMethods) => ({
      ...prevMethods,
      ...methods,
    }));
  };

  return (
    <>
      <Row style={{ margin: "3px", fontSize: "14px", marginTop: "10px" }}>
        <Col className="d-flex align-items-center" style={{ fontSize: "12px" }}>
          <NurseNameBadges />
        </Col>
        <Col xs="auto">
          <DurationStopwatch onReady={handleReady} />
        </Col>
      </Row>
      <Row>
        <Col lg={7} style={{ padding: "0px" }}>
          <PhaseButtons
            startStopwatch={control.start}
            pauseStopwatch={control.pause}
          />
        </Col>
        <Col style={{ padding: "0px" }}>
          <Phases />
        </Col>
      </Row>
    </>
  );
};

export default ObservationTaggingModule;
