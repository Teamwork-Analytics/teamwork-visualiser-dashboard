/**
 * @file ProjectList.tsx
 * @description This file exports a list of cards, each card is a project.
 */
import React from "react";
import "./ProjectList.css";
import { Project } from "src/shared/types/ProjectProps";
import ProjectCard from "../card/ProjectCard";

// TODO: make projectInput mandatory
/**
 * Return list of project cards
 * @param {Array<Project>} projectInput - Array of projects to display as a list
 * @param {function} cardOnClickFunction - Function to call when a card is clicked
 */
const ProjectList = ({
  projectInput,
  cardOnClickFunction,
}: {
  projectInput?: Array<Project>;
  cardOnClickFunction?: (...args: any[]) => any;
}) => {
  //TODO: connect to backend and not using fake data
  const projects = projectInput ? projectInput : null;

  return (
    <div
      className="project-list-div"
      style={{ color: "#222222", textDecoration: "none", marginTop: "10px" }}
    >
      {!!projects
        ? projects.map((project: Project, i: React.Key) => (
            <ProjectCard
              key={i}
              project={project}
              onClick={() => cardOnClickFunction?.(project)}
            />
          ))
        : null}
    </div>
  );
};

export default ProjectList;
