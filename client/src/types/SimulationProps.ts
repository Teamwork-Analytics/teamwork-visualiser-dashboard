/**
 * @file SimulationProps.ts
 * @description Export interface for simulation sessions
 */
import { Project } from "./ProjectProps";

export interface Simulation {
  simulationId: string;
  name: string;
  project: Project;
}
