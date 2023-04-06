/**
 * ProjectManagementPage.tsx
 *
 * @file This file exports project management page.
 * @date 03/04/2023
 */

import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import BackButton from "../../components/buttons/BackButton";
import SessionList from "../../components/cardLists/SessionList";
import ProjectList from "../../components/cardLists/ProjectList";
import ContentContainer from "../../components/containers/ContentContainer";
import { defaultStyles as styles } from "../page-styles";
import "./ProjectManagementPage.css";

const ProjectManagementPage = () => {
  const [projectFilter, setProjectFilter] = useState(undefined);

  return (
    <div style={styles.main}>
      <BackButton className="projects-back-button"></BackButton>
      <Row className="project-page-content-row">
        <Col xs={4}>
          <ContentContainer
            containerTitle="Projects"
            className="project-list-container"
          >
            <ProjectList cardOnClickFunction={setProjectFilter}></ProjectList>
          </ContentContainer>
        </Col>
        <Col>
          <ContentContainer
            containerTitle="Sessions"
            className="session-list-container"
          >
            <SessionList projectIdFilter={projectFilter}></SessionList>
          </ContentContainer>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectManagementPage;
