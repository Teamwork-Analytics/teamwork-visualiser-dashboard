/**
 * @file ContentContainer.tsx
 * @description This file exports container wrapping content to display as a modular component.
 */
import React from "react";
import ContainerTitle from "../wordings/ContainerTitle";
import "./ContentContainer.css";

/**
 * Return a container wrapping content to display as a modular component.
 * @param {React.ReactNode} children component
 * @param {string} className - Additional class name to add to the container
 */
const ContentContainer = ({
  children,
  className,
  containerTitle,
}: {
  children?: React.ReactNode;
  className?: string;
  containerTitle?: string;
}) => {
  return (
    <div className={"content-container " + className}>
      {containerTitle && <ContainerTitle title={containerTitle} />}
      {children}
    </div>
  );
};

export default ContentContainer;
