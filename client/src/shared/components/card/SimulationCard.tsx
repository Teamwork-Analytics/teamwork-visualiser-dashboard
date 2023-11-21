import React from "react";
import { Col, Row } from "react-bootstrap";
import TACard from "./TACard";
import { Simulation } from "src/shared/types/SimulationProps";

const SimulationCard = ({
  simulation,
  onClick,
}: {
  simulation: Simulation;
  onClick?: (...args: any[]) => any;
}) => {
  return (
    <TACard height={60} width={700} onClick={onClick}>
      <Row style={{ display: "flex", flexDirection: "row" }}>
        <Col>
          <label>{simulation.simulationId}</label>
        </Col>
        <Col sm="5">
          <label>{simulation.name}</label>
        </Col>
        {simulation.project && (
          <Col sm="5">
            <label>{simulation.project.name}</label>{" "}
          </Col>
        )}
      </Row>
    </TACard>
  );
};

export default SimulationCard;
