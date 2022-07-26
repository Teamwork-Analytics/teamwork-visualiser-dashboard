import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Webcam from "react-webcam";

const ObservationView = () => {
  const [tagData, setTaggedData] = useState([
    {
      label: "My thing",
      timestamp: Date.now(),
    },
  ]);

  const addTag = () => {
    setTaggedData([...tagData, { label: "", timestamp: Date.now() }]);
  };

  return (
    <div
      style={{
        margin: "0 auto",
        width: "50vw",
        maxWidth: "1440px",
        height: "100%",
        colour: "white",
      }}
    >
      <div>
        <Button variant="secondary" onClick={() => addTag()}>
          Tag Video
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h3>Timestamp</h3>
          <h3>Note</h3>
          <h3>Action</h3>
        </div>
        <div>
          {tagData.map((d) => {
            const timestamp = !!d.timestamp
              ? new Date(d.timestamp).toLocaleString()
              : "Time error!";
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <label>{timestamp}</label>
                <label>{d.label}</label>
                <Button variant="danger">Delete</Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ObservationView;
