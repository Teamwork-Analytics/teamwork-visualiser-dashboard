import React from "react";

export function ConnectionState({ isConnected }) {
  return (
    <>
      <p style={{ fontSize: "8px", margin: "0px" }}>
        Connection: {"" + isConnected}
      </p>
    </>
  );
}
