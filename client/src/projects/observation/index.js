import ObservationPrimaryControlView from "./ObservationPrimaryControlView";
import ObservationView from "./ObservationView";
import ObservationSecondaryControlView from "./ObservationSecondaryControlView";

export {
  ObservationPrimaryControlView,
  ObservationView,
  ObservationSecondaryControlView,
};

export const sortNotesDescending = (observationObj) => {
  const { phases } = observationObj;
  phases.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return phases;
};

/**
 * These phases are depending on the learning design.
 */
export const manualLabels = {
  phases: [
    { label: "Handover", description: "When doctor leaves the room" },
    { label: "Ward Nurse", description: "When extra nurses enter the room" },
    {
      label: "MET Doctor",
      description: "When doctor enters the emergency room",
    },
  ],
  actions: [
    { label: "Made a plan", description: "Students made a plan" },
    { label: "Assessed patient", description: "Students made a plan" },
    { label: "Started to assess Ruth", description: "Students made a plan" },
    { label: "Recognised some concerns", description: "Students made a plan" },
    { label: "Informed team member", description: "Students made a plan" },
    { label: "Called for help", description: "Students made a plan" },
  ],
};
