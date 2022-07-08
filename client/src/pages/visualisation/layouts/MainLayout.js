import React from "react";

/**
 * The wide layout to display the session diagram
 */
const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        height: "calc(100vh - 30px)",
        background: "#2e2e2e",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

export default MainLayout;
