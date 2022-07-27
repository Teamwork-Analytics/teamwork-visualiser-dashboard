import React from "react";
import { Card } from "react-bootstrap";
import TACard from "../../components/card/TACard";
import { Simulation } from "./Session";

const SimulationCard = ({ sim }: { sim: Simulation }) => {
  return (
    <TACard height={250}>
      <Card.Body>
        <Card.Title>{sim.sessionId}</Card.Title>
        <Card.Text>{sim.name}</Card.Text>
      </Card.Body>

      {sim.project && (
        <Card.Footer className="text-muted">{sim.project.name}</Card.Footer>
      )}
    </TACard>
  );
};

export default SimulationCard;
