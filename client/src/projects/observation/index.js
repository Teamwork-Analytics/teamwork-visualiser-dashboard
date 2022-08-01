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

export const manualLabels = {
  phases: [
    { label: "Handover", description: "When doctor leaves the room" },
    { label: "Bed 4", description: "Whene emergency is happening in Bed 4" },
    { label: "Ward Nurse", description: "When extra nurses enter the room" },
    {
      label: "MET Doctor",
      description: "When doctor enters the emergency room",
    },
  ],
};
