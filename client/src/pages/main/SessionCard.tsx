import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import TACard from "../../components/card/TACard";
import { Simulation } from "./Session";

const SimulationCard = ({ sim }: { sim: Simulation }) => {
  return (
    <TACard height={60} width={700}>
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

      {/* <Card.Body>
        <Card.Title>{sim.simulationId}</Card.Title>
        <Card.Text>{sim.name}</Card.Text>
      </Card.Body>

      {sim.project && (
        <Card.Footer className="text-muted">{sim.project.name}</Card.Footer>
      )} */}
    </TACard>
  );
};

export default SimulationCard;
