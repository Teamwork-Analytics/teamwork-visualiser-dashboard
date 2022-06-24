import React from "react";
import ControlLayout from "./ControlLayout";
import ListLayout from "./ListLayout";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { Dropdown } from "react-bootstrap";
/**
 * The sidebar (narrow) that exists together with Diagram layout
 */
const SidebarLayout = () => {
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
  return (
    <div style={styles.outer}>
      <div style={styles.title}>
        <ArrowLeft
          style={styles.backButton}
          onClick={() => navigate("/main")}
          size={"30px"}
        />
        <h1 style={{ fontFamily: "Open Sans, sans-serif" }}>
          {params.sessionName}
        </h1>
      </div>
      <div style={{ width: "100%" }}>
        <div className="d-grid gap-2">
          <Dropdown>
            <Dropdown.Toggle
              id="dropdown-button-dark-example1"
              variant="secondary"
              style={{ width: "100%" }}
            >
              Observation
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark">
              <Dropdown.Item href="#/action-1" active>
                Collaboration Graph
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">Timeline</Dropdown.Item>
              <Dropdown.Item href="#/action-3">ENA</Dropdown.Item>
              <Dropdown.Item href="#/action-4">
                Audio Social Activities
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <ControlLayout></ControlLayout>
      <ListLayout>
        <label>Project: Nursing</label>
        <label>Project: Nursing</label>
        <label>Project: Nursing</label>
        <label>Project: Nursing</label>
        <label>Project: Nursing</label>
      </ListLayout>
    </div>
  );
};

export default SidebarLayout;
