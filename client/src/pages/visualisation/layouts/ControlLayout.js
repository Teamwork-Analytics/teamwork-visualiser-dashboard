import React from "react";

/**
 * The controller part inside the Sidebar
 */
const ControlLayout = ({ children }) => {
  const styles = {
    outer: {
      width: "100%",
      height: "20vh",
      backgroundColor: "#1a1a1a",
      borderRadius: "15px",
      overflowY: "scroll",
      padding: "1em",
      margin: "5px auto",
    },
  };

  return <div style={styles.outer}>{children}</div>;
};

export default ControlLayout;
