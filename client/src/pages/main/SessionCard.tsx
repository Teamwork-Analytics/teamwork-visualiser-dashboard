import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import TACard from "../../components/card/TACard";
import { Simulation } from "./Session";

const SimulationCard = ({
  sim,
  onClick,
}: {
  sim: Simulation;
  onClick?: (...args: any[]) => any;
}) => {
  return (
    <TACard height={200} width={200} onClick={onClick}>
      <Row style={{ display: "flex", flexDirection: "column" }}>
        {/* <Col> */}
        <h1>{sim.simulationId}</h1>
        {/* </Col> */}
        {/* <Col sm="5"> */}
        <label>{sim.name}</label>
        {/* </Col> */}
        {sim.project && (
          // <Col sm="5">
          <small>
            <br />
            <i>{sim.project.name}</i>
          </small>
          // </Col>
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
