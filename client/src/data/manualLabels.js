export const TEAM_NAME = "Teamwork Analytics Team";

export const OBSERVATION_TOAST_MESSAGES = (sessionId) => {
  return {
    baseline: `Baseline for team ${sessionId} has started`,
    start: `Simulation for team ${sessionId} has started`,
    end: `Simulation for team ${sessionId} has stopped`,
    reset: `Sucessfully reset session ${sessionId}.`,
  };
};
