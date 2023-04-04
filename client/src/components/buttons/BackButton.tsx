/**
 * @file BackButton.tsx
 * @description This file exports styled back button for pages/components.
 */
import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * Return a back buttons that navigates to the given url, or previous page if url is not provided.
 * @param {string} backUrl - Url string of the target page.
 */
const BackButton = ({ backUrl }: { backUrl?: string }) => {
  const navigate = useNavigate();

  // Navigate to url provided or previous page when button pressed.
  const handleBackButtonPressed = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button size={"lg"} variant="dark" onClick={handleBackButtonPressed}>
      &larr; Back
    </Button>
  );
};

export default BackButton;
