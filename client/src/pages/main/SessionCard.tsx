import { Col, Row } from "react-bootstrap";
import TACard from "@components/card/TACard";
import { Simulation } from "./Session";

const SimulationCard = ({
  sim,
  onClick,
}: {
  sim: Simulation;
  onClick?: (...args: any[]) => any;
}) => {
  return (
    <TACard height={70} width={700} onClick={onClick}>
      <Row style={{ display: "flex", flexDirection: "row" }}>
        <Col>
          <label>{sim.simulationId}</label>
        </Col>
        <Col sm="5">
          <label>{sim.name}</label>
        </Col>
        {sim.project && (
          <Col sm="5">
            <label>{sim.project.name}</label>{" "}
          </Col>
        )}
      </Row>
    </TACard>
  );
};

export default SimulationCard;
