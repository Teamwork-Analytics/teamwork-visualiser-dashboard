import React, { useState } from "react";

const SimpleErrorText = ({ isError, message, children }) => {
  return <div>{isError ? <p>{message}</p> : children}</div>;
};
export default SimpleErrorText;
