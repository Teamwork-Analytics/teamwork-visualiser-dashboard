/**
 * ProjectManagementPage.tsx
 *
 * @file This file exports project management page.
 * @date 03/04/2023
 */

import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import BackButton from "src/shared/components/buttons/BackButton";
import SessionList from "src/shared/components/cardLists/SessionList";
import ProjectList from "src/shared/components/cardLists/ProjectList";
import ContentContainer from "src/shared/components/containers/ContentContainer";
import { defaultStyles as styles } from "../page-styles";
import ProjectCreateModal from "./ProjectCreateModal";
import SessionCreateModal from "./SessionCreateModal";
import "./ProjectManagementPage.css";
import EditProjectModal from "./EditProjectModal";
import { Simulation } from "src/shared/types/SimulationProps";
import EditSessionModal from "./EditSessionModal";

export const fakeProjects = [
  { projectId: "002", name: "Clayton Nursing Simulation" },
  { projectId: "001", name: "Peninsula Nursing Simulation" },
];

const ProjectManagementPage = () => {
  const [projectFilter, setProjectFilter] = useState({
    projectId: undefined,
    name: undefined,
  });

  const [showProjectModal, setShowProjectModal] = useState(false);

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
  };

  const handleProjectCreate = (name: string, projectId: string) => {
    console.log("Project created:", name, projectId);
    // TODO: Add logic to handle creating project
  };

  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleSessionModalClose = () => {
    setShowSessionModal(false);
  };

  const handleSessionCreate = (
    sessionId: string,
    sessionName: string,
    projectId: string
  ) => {
    console.log("Session created:", sessionId, sessionName, projectId);
    // TODO: Add logic to handle creating session
  };

  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const handleEditProjectModalClose = () => {
    setShowEditProjectModal(false);
  };

  const handleProjectSave = (newProjectId: string, newProjectName: string) => {
    console.log("Project updated:", newProjectId, newProjectName);
    // TODO: Add logic to handle editing project
  };

  const [selectedSimulation, setSelectedSimulation] =
    useState<Simulation | null>(null);

  const [showEditSessionModal, setShowEditSessionModal] = useState(false);

  return (
    <div style={styles.main}>
      <BackButton className="projects-back-button"></BackButton>
      <Row className="project-page-content-row">
        <Col xs={4}>
          <ContentContainer
            containerTitle="Projects"
            className="project-list-container"
          >
            <Button onClick={() => setShowProjectModal(true)}>
              {" "}
              + Create Project
            </Button>
            <ProjectCreateModal
              show={showProjectModal}
              handleClose={handleProjectModalClose}
              handleCreate={handleProjectCreate}
            />
            <ProjectList cardOnClickFunction={setProjectFilter}></ProjectList>
          </ContentContainer>
        </Col>
        <Col>
          <ContentContainer
            containerTitle="Sessions"
            className="session-list-container"
          >
            <Button onClick={() => setShowSessionModal(true)}>
              + Create Session
            </Button>
            <SessionCreateModal
              show={showSessionModal}
              projects={fakeProjects}
              handleClose={handleSessionModalClose}
              handleCreate={handleSessionCreate}
            />
            {projectFilter.name && (
              <Button
                onClick={() => setShowEditProjectModal(true)}
                style={{ marginTop: 10 }}
              >
                Edit Project: {projectFilter.name}
              </Button>
            )}
            {showEditProjectModal &&
              projectFilter.projectId &&
              projectFilter.name && (
                <EditProjectModal
                  show={showEditProjectModal}
                  projectId={projectFilter.projectId}
                  projectName={projectFilter.name}
                  handleClose={handleEditProjectModalClose}
                  handleSave={handleProjectSave}
                />
              )}
            <SessionList
              projectIdFilter={projectFilter.projectId}
              edit
              editButtonClickFunction={(sim) => {
                setSelectedSimulation(sim);
                setShowEditSessionModal(true);
              }}
            ></SessionList>
            {selectedSimulation && (
              <EditSessionModal
                show={showEditSessionModal}
                handleClose={() => setShowEditSessionModal(false)}
                simulation={selectedSimulation}
              />
            )}
          </ContentContainer>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectManagementPage;
