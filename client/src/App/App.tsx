import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import VisualisationPage from "../pages/visualisation/VisualisationPage";
import SessionsPage from "../pages/session/SessionsPage";
import ErrorPage from "../pages/error/ErrorPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TEAM_NAME } from "../data/manualLabels";
import { Toaster } from "react-hot-toast";

function App() {
  const styles = {
    footer: {
      height: "30px",
      textAlign: "center" as const,
      position: "fixed" as const,
      margin: "0 auto",
      background: "#222222",
      width: "100vw",
      color: "grey",
    },
  };

  return (
    <div className="App">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/main" element={<SessionsPage />} />
          <Route
            path="/visualisation/:sessionId"
            element={<VisualisationPage />}
          />
          <Route path="*" element={<ErrorPage defaultUrl={"/main"} />} />
          <Route path="/" element={<Navigate replace to="/main" />} />
        </Routes>
      </BrowserRouter>
      <footer style={styles.footer}>
        <small>
          by {TEAM_NAME} &copy; {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}

export default App;
