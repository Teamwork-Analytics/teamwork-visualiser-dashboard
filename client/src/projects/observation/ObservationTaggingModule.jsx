import { Row, Col } from "react-bootstrap";
import PhaseButtons from "./PhaseButtons";
import Phases from "./Phases";
import NurseNameBadges from "./visualisationComponents/NurseNameBadges";
import DurationStopwatch from "./visualisationComponents/DurationStopwatch";

const ObservationTaggingModule = () => {
  return (
    <>
      <Row style={{ margin: "3px", fontSize: "14px", marginTop: "10px" }}>
        <Col className="d-flex align-items-center" style={{ fontSize: "12px" }}>
          <NurseNameBadges />
        </Col>
        <Col xs="auto">
          <DurationStopwatch />
        </Col>
      </Row>
      <Row>
        <Col lg={7} style={{ padding: "0px" }}>
          <PhaseButtons />
        </Col>
        <Col style={{ padding: "0px" }}>
          <Phases />
        </Col>
      </Row>
    </>
  );
};

export default ObservationTaggingModule;
