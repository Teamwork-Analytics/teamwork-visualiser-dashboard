export const TEAM_NAME = "Teamwork Analytics Team";

export const OBSERVATION_TOAST_MESSAGES = (teamName) => {
  return {
    baseline: `Baseline for team ${teamName} has started`,
    start: `Simulation for team ${teamName} has started`,
    end: `Simulation for team ${teamName} has stopped`,
  };
};
