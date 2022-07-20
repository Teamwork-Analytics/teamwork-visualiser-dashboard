import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Webcam from "react-webcam";

const ObservationView = () => {
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div style={{ margin: "0 auto", width: "100%", height: "100%" }}>
      <Webcam
        width={"100%"}
        height={"90%"}
        onUserMediaError={(text) => setErrorMessage(text)}
      >
        {({ getScreenshot }) => (
          <Button
            variant="secondary"
            onClick={() => {
              const imageSrc = getScreenshot();
            }}
          >
            Tag Video
          </Button>
        )}
      </Webcam>
    </div>
  );
};
export default ObservationView;
