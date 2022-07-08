import React, { useState } from "react";
import ControlLayout from "./ControlLayout";
import ListLayout from "./ListLayout";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, GearFill } from "react-bootstrap-icons";
import { Dropdown } from "react-bootstrap";
import ObservationControlView from "../../../projects/observation/ObservationControlView";
/**
 * The sidebar (narrow) that exists together with Diagram layout
 */
const SidebarLayout = ({ tool, setTool }) => {
  let params = useParams();
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

  const availableTools = {
    observation: "Observation",
    "teamwork-vis": "Teamwork Barchart",
    "hive-vis": "Position and Audio",
    "audio-socnet-vis": "Audio Social Network",
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
          {params.sessionName}
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
              {availableTools[tool]}
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark" onClick={(e) => setTool(e.target.id)}>
              {Object.keys(availableTools).map((d) => (
                <Dropdown.Item id={d} active={tool === d}>
                  {availableTools[d]}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <ControlLayout>
        {tool !== "hive-vis" && <ObservationControlView />}
      </ControlLayout>

      <ListLayout>
        <label>{tool}</label>
      </ListLayout>
    </div>
  );
};

export default SidebarLayout;
