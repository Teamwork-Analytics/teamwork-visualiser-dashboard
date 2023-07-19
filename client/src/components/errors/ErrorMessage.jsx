import React, { useState } from "react";

const SimpleErrorText = ({ isError, message, children }) => {
  return (
    <div style={{ height: "30vh" }}>
      {isError ? <p>{message}</p> : children}
    </div>
  );
};
export default SimpleErrorText;
