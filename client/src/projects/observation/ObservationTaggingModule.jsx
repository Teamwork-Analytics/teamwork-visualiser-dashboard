import { Row, Col } from "react-bootstrap";
import PhaseButtons from "./PhaseButtons";
import Phases from "./Phases";

const ObservationTaggingModule = () => {
  return (
    <Row>
      <Col lg={7} style={{ padding: "0px" }}>
        <PhaseButtons />
      </Col>
      <Col style={{ padding: "0px" }}>
        <Phases />
      </Col>
    </Row>
  );
};

export default ObservationTaggingModule;
