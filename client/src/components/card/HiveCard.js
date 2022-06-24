import React from "react";
import "./HiveCard.css";

const HiveCard = ({ size = 200, height = 200, width = 200, children }) => {
  const _size = size || "200px";

  const styles = {
    main: {
      height: height || _size,
      width: width || _size,
      background: "white",
      borderRadius: "0.7em",
      padding: "1.5em",
      boxShadow: "0px 2px 5px 0px #708ff3",
      cursor: "pointer",
    },
  };
  return (
    <div className={"hive-card"} style={styles.main}>
      {children}
    </div>
  );
};

export default HiveCard;
