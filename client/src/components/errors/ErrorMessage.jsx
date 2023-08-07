import React, { useState } from "react";

const SimpleErrorText = ({ isError, message, children }) => {
  return (
    <div style={{ minHeight: "30vh", padding: "20px" }}>
      {isError ? <p>{message}</p> : children}
    </div>
  );
};
export default SimpleErrorText;
