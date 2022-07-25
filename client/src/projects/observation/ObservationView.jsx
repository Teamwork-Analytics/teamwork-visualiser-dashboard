import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Webcam from "react-webcam";

const ObservationView = () => {
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div style={{ margin: "0 auto", width: "100%", height: "100%" }}>
      <Button variant="secondary">Tag Video</Button>
    </div>
  );
};
export default ObservationView;
