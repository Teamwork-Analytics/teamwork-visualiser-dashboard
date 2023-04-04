/**
 * @file ContentContainer.tsx
 * @description This file exports container wrapping content to display as a modular component.
 */
import React from "react";
import "./ContentContainer.css";

/**
 *
 * @param {React.ReactNode} children
 * @returns
 */
const ContentContainer = ({ children }: { children?: React.ReactNode }) => {
  return <div className="content-container">{children}</div>;
};

export default ContentContainer;
