import React from "react";

/**
 * The controller part inside the Sidebar
 */
const PrimaryControlLayout = ({ children }) => {
  const styles = {
    outer: {
      width: "100%",
      height: "25vh",
      backgroundColor: "#fafafa", //#1a1a1a
      borderRadius: "15px",
      overflowY: "scroll",
      padding: "1em",
      margin: "5px auto",
    },
  };

  return <div style={styles.outer}>{children}</div>;
};

export default PrimaryControlLayout;
