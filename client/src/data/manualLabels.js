export const TEAM_NAME = "Teamwork Analytics Team";

export const OBSERVATION_TOAST_MESSAGES = (simulationId) => {
  return {
    baseline: `Baseline for team ${simulationId} has started.`,
    start: `Simulation for team ${simulationId} has started.`,
    end: `Simulation for team ${simulationId} has stopped.`,
    reset: `Sucessfully reset all captured time for session ${simulationId}.`,
  };
};
