/**
 * @file BackButton.tsx
 * @description This file exports styled back button for pages/components.
 */
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

/**
 * Return a back buttons that navigates to the given url, or previous page if url is not provided.
 * @param {string} backUrl - Url string of the target page.
 * @param {string} className - Additional class name to add to the container
 */
const BackButton = ({
  backUrl,
  className,
}: {
  backUrl?: string;
  className?: string;
}) => {
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
    <Button
      className={"shared-back-button " + className}
      size={"lg"}
      variant="light"
      onClick={handleBackButtonPressed}
    >
      &larr; Back
    </Button>
  );
};

export default BackButton;
