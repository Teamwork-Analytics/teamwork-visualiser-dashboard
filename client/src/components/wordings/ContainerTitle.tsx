/**
 * @file ContainerTitle.tsx
 * @description This file exports text to display as a title in content container.
 */
import React from "react";
import "./ContainerTitle.css";

/**
 * Return a text to display as a title.
 * @param {string} title - Text to display as title.
 * @param {string} className - Additional class name to add to the text
 */
const ContainerTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return <h4 className={"container-title-text " + className}>{title}</h4>;
};

export default ContainerTitle;
