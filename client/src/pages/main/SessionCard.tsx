import React from "react";
import { Card } from "react-bootstrap";
import TACard from "../../components/card/TACard";
import { Team } from "./Session";

const TeamCard = ({ team }: { team: Team }) => {
  return (
    <TACard height={250}>
      <Card.Body>
        <Card.Title>{team.sessionId}</Card.Title>
        <Card.Text>{team.name}</Card.Text>
      </Card.Body>

      {team.project && (
        <Card.Footer className="text-muted">{team.project}</Card.Footer>
      )}
    </TACard>
  );
};

export default TeamCard;
