/**
 * @file BackToMainButtonLight.tsx
 * @description This file exports back to main button in light theme
 */
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * Return a back buttons that navigates to main page
 */
const BackToMainButtonLight = () => {
  const navigate = useNavigate();

  // Navigate to main page
  const handleBackButtonPressed = () => {
    navigate("/main");
  };

  return (
    <Button
      style={{
        backgroundColor: "white",
        borderRadius: "0.5em",
        boxShadow:
          "0px 4px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
      }}
      variant="light"
      onClick={handleBackButtonPressed}
    >
      &larr; Back
    </Button>
  );
};

export default BackToMainButtonLight;
