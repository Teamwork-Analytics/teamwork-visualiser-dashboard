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
};
