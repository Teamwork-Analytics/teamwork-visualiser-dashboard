import React from "react";
import { Card } from "react-bootstrap";
import TACard from "../../components/card/TACard";
import { Session } from "./Session";

const SessionCard = ({ session }: { session: Session }) => {
  return (
    <TACard height={250}>
      <Card.Body>
        <Card.Title>{session.sessionId}</Card.Title>
        <Card.Text>{session.name}</Card.Text>
      </Card.Body>

      {session.project && (
        <Card.Footer className="text-muted">{session.project}</Card.Footer>
      )}
    </TACard>
  );
};

export default SessionCard;
