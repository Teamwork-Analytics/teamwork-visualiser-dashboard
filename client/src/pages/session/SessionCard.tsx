import React from "react";
import HiveCard from "../../components/card/HiveCard";
import { Session } from "./Session";

const SessionCard = ({ session }: { session: Session }) => {
  const styles = {
    body: {},
  };

  return (
    <HiveCard height={250}>
      <div style={{ textAlign: "left" }}>
        <h3>{session.name}</h3>
        <label>{session.project && session.project}</label>
      </div>
    </HiveCard>
  );
};

export default SessionCard;
