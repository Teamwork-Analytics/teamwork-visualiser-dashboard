import React from "react";
import { Button } from "react-bootstrap";

const ObservationSecondaryControlView = () => {
  const time = new Date(Date.now());
  return (
    <div>
      <h1>Synchronisation</h1>
      <div>
        <label style={{ color: "grey" }}>2x049f Green</label>
        <label>{time.toLocaleString()}</label>
        <label>{}</label>
      </div>
    </div>
  );
};

export default ObservationSecondaryControlView;
