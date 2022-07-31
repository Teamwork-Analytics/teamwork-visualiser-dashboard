export const TEAM_NAME = "Teamwork Analytics Team";

export const OBSERVATION_TOAST_MESSAGES = (simulationId) => {
  return {
    baselineTime: `Baseline for team ${simulationId} has started.`,
    startTime: `Simulation for team ${simulationId} has started.`,
    stopTime: `Simulation for team ${simulationId} has stopped and is complete.`,
    reset: `Sucessfully reset all captured time for session ${simulationId}.`,
  };
};
