import React from "react";
import Webcam from "react-webcam";

const ObservationView = () => {
  return (
    <div style={{ margin: "0 auto", width: "100%", height: "100%" }}>
      <Webcam width={"100%"} height={"100%"} />
    </div>
  );
};
export default ObservationView;
