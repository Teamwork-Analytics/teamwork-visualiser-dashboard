import React, { useState } from "react";

const SimpleErrorText = ({ isError, message, children }) => {
  return (
    <>
      {isError ? (
        <div style={{ minHeight: "30vh", padding: "20px" }}>
          <p>{message}</p>
        </div>
      ) : (
        children
      )}
    </>
  );
};
export default SimpleErrorText;
