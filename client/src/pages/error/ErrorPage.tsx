import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { defaultStyles as styles } from "../page-styles";

const ErrorPage = ({ defaultUrl }: { defaultUrl: string }) => {
  const navigate = useNavigate();
  return (
    <div style={styles.main}>
      <h1 style={styles.title}>Oops!🙊</h1>
      <p>The page does not exist!</p>
      <Button size={"lg"} variant="dark" onClick={() => navigate(defaultUrl)}>
        &larr; Bring me back
      </Button>
    </div>
  );
};

export default ErrorPage;
