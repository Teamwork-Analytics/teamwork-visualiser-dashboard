import React from "react";

/**
 * The controller part inside the Sidebar
 */
const SecondaryControlLayout = ({ children }) => {
  const styles = {
    outer: {
      width: "100%",
      height: "65vh",
      backgroundColor: "#1a1a1a",
      borderRadius: "15px",
      padding: "1em",
      textAlign: "left",
      overflowY: "scroll",
      margin: "5px auto",
    },
  };
  return <div style={styles.outer}>{children}</div>;
};

export default SecondaryControlLayout;
