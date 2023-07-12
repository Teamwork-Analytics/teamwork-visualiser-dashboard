/**
 * @file SessionList.tsx
 * @description This file exports a list of cards, each card is a session.
 */
import React from "react";
import { Simulation } from "../../types/SimulationProps";
import SimulationCard from "../card/SimulationCard";
import "./SessionList.css";
import { Button } from "react-bootstrap";
import { BsPencil } from "react-icons/bs";

interface SessionListProps {
  simulationsInput?: Array<Simulation>;
  projectIdFilter?: string;
  cardOnClickFunction?: (sim: Simulation) => void;
  editButtonClickFunction?: (sim: Simulation) => void;
  edit?: boolean;
}

// TODO: make simulationInput mandatory
/**
 * Return list of session cards
 * @param {Array<Simulation>} simulationInput - Array of simulations to display as a list
 * @param {string} projectIdFilter - Filter the list of simulations by project id
 * @param {function} cardOnClickFunction - Function to call when a card is clicked
 */
const SessionList = ({
  simulationsInput,
  projectIdFilter,
  cardOnClickFunction,
  editButtonClickFunction,
  edit,
}: SessionListProps) => {
  //TODO: connect to backend and not using fake data
  const simulations = simulationsInput 

  return (
    <div
      className="session-list-div"
      style={{ color: "#222222", textDecoration: "none", marginTop: "10px" }}
    >
      {!!simulations
        ? simulations
            .filter(
              (sim: Simulation) =>
                !projectIdFilter || sim.project.projectId === projectIdFilter
            )
            .map((sim: Simulation, i: React.Key) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <SimulationCard
                  simulation={sim}
                  onClick={() =>
                    cardOnClickFunction && cardOnClickFunction(sim)
                  }
                />
                {edit && (
                  <Button
                    variant="link"
                    onClick={() =>
                      editButtonClickFunction && editButtonClickFunction(sim)
                    }
                  >
                    <BsPencil />
                  </Button>
                )}
              </div>
            ))
        : null}
    </div>
  );
};

export default SessionList;
