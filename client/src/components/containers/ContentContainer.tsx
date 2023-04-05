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
const ContentContainer = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return <div className={"content-container " + className}>{children}</div>;
};

export default ContentContainer;
