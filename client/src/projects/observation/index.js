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
    {
      _id: "mockPhaseId001",
      label: "Handover ends",
    },
    {
      _id: "mockPhaseId002",
      label: "Secondary nurse enters",
    },
    {
      _id: "mockPhaseId004",
      label: "Doctor enters",
    },
    { _id: "mockPhaseId005", label: "Teamwork" },
  ],
  actions: [
    {
      label: "Made a plan",
      phasesAssociated: ["mockPhaseId001"],
    },
    { label: "Assessed patient", phasesAssociated: ["mockPhaseId001"] },
    { label: "Starting to assess Ruth", phasesAssociated: ["mockPhaseId001"] },
    {
      label: "Recognised some concerns",
      phasesAssociated: ["mockPhaseId001", "mockPhaseId005"],
    },
    {
      label: "Verbalisation of problem",
      phasesAssociated: ["mockPhaseId001", "mockPhaseId005"],
    },
    {
      label: "Informing team member",
      phasesAssociated: ["mockPhaseId005"],
    },
    { label: "Applying oxygen", phasesAssociated: ["mockPhaseId001"] },
    {
      label: "Discuss about calling for help",
      phasesAssociated: ["mockPhaseId001", "mockPhaseId001", "mockPhaseId005"],
    },
    { label: "Called for help", phasesAssociated: ["mockPhaseId001"] },
    {
      label: "Handover to secondary nurse",
      phasesAssociated: ["mockPhaseId002"],
    },
    {
      label: "Reassessment after recognition of deterioration",
      phasesAssociated: ["mockPhaseId002"],
    },
    { label: "Sharing the load", phasesAssociated: ["mockPhaseId005"] },
    { label: "MET call", phasesAssociated: ["mockPhaseId002"] },
    {
      label: "Handover to doctor",
      phasesAssociated: ["mockPhaseId004"],
    },
    {
      label: "Reprioritisation",
      phasesAssociated: ["mockPhaseId004", "mockPhaseId005"],
    },
    {
      label: "Efficiency of distributing workload",
      phasesAssociated: ["mockPhaseId005"],
    },
    {
      label: "Inefficiency of distributing workload",
      phasesAssociated: ["mockPhaseId005"],
    },
    { label: "Good communication", phasesAssociated: ["mockPhaseId005"] },
    { label: "Bad communication", phasesAssociated: ["mockPhaseId005"] },
    { label: "Good teamwork", phasesAssociated: ["mockPhaseId005"] },
    { label: "Bad teamwork", phasesAssociated: ["mockPhaseId005"] },
  ],
};
