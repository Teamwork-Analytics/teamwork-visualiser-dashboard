import React from "react";

/**
 * The controller part inside the Sidebar
 */
const ListLayout = ({ children }) => {
  const styles = {
    outer: {
      width: "100%",
      height: "60vh",
      backgroundColor: "#1a1a1a",
      borderRadius: "15px",
      padding: "1em",
      textAlign: "left",
      overflowY: "scroll",
    },
  };
  return <div style={styles.outer}>{children}</div>;
};

export default ListLayout;
