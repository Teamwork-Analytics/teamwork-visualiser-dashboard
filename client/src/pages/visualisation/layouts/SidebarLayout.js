import React from "react";
import PrimaryControlLayout from "./PrimaryControlLayout";
import SecondaryControlLayout from "./SecondaryControlLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { Dropdown } from "react-bootstrap";
import { availableTools } from "../VisualisationContext";
import EmptyPlaceholder from "../../../components/EmptyPlaceholder";

/**
 * The sidebar (narrow) that exists together with Diagram layout
 */
const SidebarLayout = ({ tool, setTool }) => {
  let location = useLocation();
  const navigate = useNavigate();

  const styles = {
    outer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minWidth: 400,
      maxWidth: 500,
      width: "20vw",
      height: "calc(100vh - 30px)",
      backgroundColor: "#212529",
      padding: "1em",
      color: "white",
    },
    title: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.outer}>
      <div style={styles.title}>
        <ArrowLeft
          style={styles.backButton}
          onClick={() => navigate("/main")}
          size={"30px"}
        />
        <h4 style={{ fontFamily: "Open Sans, sans-serif" }}>
          {!!location.state && location.state.name}
        </h4>
      </div>
      <div style={{ width: "100%" }}>
        <div className="d-grid gap-2">
          <Dropdown>
            <Dropdown.Toggle
              id="tool-selector"
              variant="primary"
              style={{ width: "100%" }}
            >
              {availableTools[tool].label}
            </Dropdown.Toggle>

            <Dropdown.Menu
              variant="dark"
              onClick={(e) => {
                if (e.target.id !== "") {
                  setTool(e.target.id);
                }
              }}
            >
              {Object.keys(availableTools).map((d) => (
                <Dropdown.Item key={d} id={d} active={tool === d}>
                  {availableTools[d].label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <PrimaryControlLayout>
        {availableTools[tool].primaryControlView === undefined ? (
          <EmptyPlaceholder />
        ) : (
          availableTools[tool].primaryControlView
        )}
      </PrimaryControlLayout>
      <SecondaryControlLayout>
        {availableTools[tool].secondaryControlView === undefined ? (
          <EmptyPlaceholder />
        ) : (
          availableTools[tool].secondaryControlView
        )}
      </SecondaryControlLayout>
    </div>
  );
};

export default SidebarLayout;
