import React from "react";
import { Col, Row } from "react-bootstrap";
import TACard from "./TACard";
import { Project } from "src/shared/types/ProjectProps";

const ProjectCard = ({
  project,
  onClick,
}: {
  project: Project;
  onClick?: (...args: any[]) => any;
}) => {
  return (
    <TACard height={60} width={400} onClick={onClick}>
      <Row style={{ display: "flex", flexDirection: "row" }}>
        <Col>
          <label>{project.projectId}</label>
        </Col>
        <Col sm="8">
          <label>{project.name}</label>
        </Col>
      </Row>
    </TACard>
  );
};

export default ProjectCard;
