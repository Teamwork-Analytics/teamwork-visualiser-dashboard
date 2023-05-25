import React from "react";
import { Card } from "react-bootstrap";
import "./TACard.css";

const TACard = ({
  size = 200,
  height = 200,
  width = 200,
  children,
  onClick,
}) => {
  const _size = size || "200px";

  const styles = {
    main: {
      height: height || _size,
      width: width || _size,
      background: "white",
      borderRadius: "0.5em",
      padding: "1em",
      boxShadow: "0px 5px 1px 0px #aaaaaa",
      cursor: "pointer",
    },
  };
  return (
    <Card className={"ta-card"} style={styles.main} onClick={onClick}>
      {children}
    </Card>
  );
};

export default TACard;
