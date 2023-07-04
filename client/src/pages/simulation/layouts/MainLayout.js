import React from "react";

/**
 * The wide layout to display the session diagram
 */
const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        height: "calc(100vh - 30px)",
        // background: "#",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        padding: "1em",
      }}
    >
      {children}
    </div>
  );
};

export default MainLayout;
