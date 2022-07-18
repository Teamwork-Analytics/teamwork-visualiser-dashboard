import React from "react";
import { Button } from "react-bootstrap";

const ObservationSecondaryControl = () => {
  return (
    <div>
      <Button variant="light" value={"tag"} disabled>
        Note +
      </Button>
    </div>
  );
};

export default ObservationSecondaryControl;
