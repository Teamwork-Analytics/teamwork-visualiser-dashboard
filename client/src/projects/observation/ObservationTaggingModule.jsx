import { Row, Col } from "react-bootstrap";
import PhaseButtons from "./PhaseButtons";
import Phases from "./Phases";
import NurseNameBadges from "./visualisationComponents/NurseNameBadges";
import DurationStopwatch from "./visualisationComponents/DurationStopwatch";
import { useState } from "react";

const ObservationTaggingModule = () => {
  // lift up start pause control from DurationStopwatch component
  const [control, setControl] = useState({ start: () => {}, pause: () => {} });
  const handleReady = (methods) => {
    setControl(methods);
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
