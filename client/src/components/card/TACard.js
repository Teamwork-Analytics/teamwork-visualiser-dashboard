import React from "react";
import { Card } from "react-bootstrap";
import "./TACard.css";

const TACard = ({ size = 200, height = 200, width = 200, children }) => {
  const _size = size || "200px";

  const styles = {
    main: {
      height: height || _size,
      width: width || _size,
      background: "white",
      borderRadius: "0.5em",
      padding: "1em",
      boxShadow: "0px 2px 5px 0px #708ff3",
      cursor: "pointer",
    },
  };
  return (
    <Card className={"ta-card"} style={styles.main}>
      {children}
    </Card>
  );
};

export default TACard;
