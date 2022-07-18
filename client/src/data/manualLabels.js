export const TEAM_NAME = "Teamwork Analytics Team";

export const OBSERVATION_TOAST_MESSAGES = (sessionId) => {
  return {
    baseline: `Baseline for session ${sessionId} has started`,
    start: `Session ${sessionId} has started`,
    end: `Session ${sessionId} has stopped`,
  };
};
