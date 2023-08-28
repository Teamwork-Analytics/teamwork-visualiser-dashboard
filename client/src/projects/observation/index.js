import ObservationView from "./ObservationView";

export { ObservationView };

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
    { _id: "phaseId001", label: "Scenario started" },
    { _id: "phaseId002", label: "Handover ends" },
    { _id: "phaseId003", label: "Secondary nurse enters" },
    { _id: "phaseId004", label: "Doctor enters" },
    { _id: "phaseId005", label: "Teamwork actions" },
  ],
  actions: [
    // Scenario started actions
    { label: "Clarifies information", phasesAssociated: ["phaseId001"] },
    { label: "Seeks information", phasesAssociated: ["phaseId001"] },
    { label: "Checks equipment", phasesAssociated: ["phaseId001"] },
    { label: "Discusses plan", phasesAssociated: ["phaseId001"] },
    // Handover ends actions
    { label: "Makes plan/ Prioritises care", phasesAssociated: ["phaseId002"] },
    { label: "Assesses patient/s", phasesAssociated: ["phaseId002"] },
    { label: "Assesses Ruth", phasesAssociated: ["phaseId002"] },
    { label: "Recognises deterioration", phasesAssociated: ["phaseId002"] },
    { label: "Verbalises concerns", phasesAssociated: ["phaseId002"] },
    { label: "Applies oxygen", phasesAssociated: ["phaseId002"] },
    { label: "Discusses call for help", phasesAssociated: ["phaseId002"] },
    { label: "Calls for help (ward only)", phasesAssociated: ["phaseId002"] },
    { label: "Calls MET", phasesAssociated: ["phaseId002"] },
    { label: "Documents care", phasesAssociated: ["phaseId002"] },
    { label: "Communicates with relative", phasesAssociated: ["phaseId002"] },
    { label: "Care for patient/s (Bed 1-3)", phasesAssociated: ["phaseId002"] },
    // Secondary nurse enters actions
    { label: "Handover to secondary nurse", phasesAssociated: ["phaseId003"] },
    { label: "Reassessment", phasesAssociated: ["phaseId003"] },
    { label: "Delegates care", phasesAssociated: ["phaseId003"] },
    { label: "Care for patient/s (Bed 1-3)", phasesAssociated: ["phaseId003"] },
    { label: "Recognises deterioration", phasesAssociated: ["phaseId003"] },
    { label: "Calls MET", phasesAssociated: ["phaseId003"] },
    { label: "Ceases PCA", phasesAssociated: ["phaseId003"] },
    { label: "Assesses leg for DVT", phasesAssociated: ["phaseId003"] },
    { label: "Documents care", phasesAssociated: ["phaseId003"] },
    // Doctor enters actions
    { label: "Handover to doctor", phasesAssociated: ["phaseId004"] },
    { label: "Reprioritises care", phasesAssociated: ["phaseId004"] },
    { label: "Reassessment", phasesAssociated: ["phaseId004"] },
    { label: "Administers IV fluid", phasesAssociated: ["phaseId004"] },
    { label: "Administers medication", phasesAssociated: ["phaseId004"] },
    { label: "Documents care", phasesAssociated: ["phaseId004"] },
    // Teamwork actions
    { label: "Recognises deterioration", phasesAssociated: ["phaseId005"] },
    { label: "Verbalises concern", phasesAssociated: ["phaseId005"] },
    { label: "Shares information", phasesAssociated: ["phaseId005"] },
    { label: "Discusses call for help", phasesAssociated: ["phaseId005"] },
    { label: "Delegates care", phasesAssociated: ["phaseId005"] },
    { label: "Reprioritisation", phasesAssociated: ["phaseId005"] },
    { label: "Effectively working together", phasesAssociated: ["phaseId005"] },
    { label: "Working independently", phasesAssociated: ["phaseId005"] },
    { label: "Communicates effectively", phasesAssociated: ["phaseId005"] },
    { label: "Closed loop communication", phasesAssociated: ["phaseId005"] },
    { label: "Seeks information", phasesAssociated: ["phaseId005"] },
    { label: "Clarifies information", phasesAssociated: ["phaseId005"] },
    { label: "Communicates ineffectively", phasesAssociated: ["phaseId005"] },
    { label: "Effective leadership", phasesAssociated: ["phaseId005"] },
    { label: "Effective followership", phasesAssociated: ["phaseId005"] },
    { label: "Allocates roles", phasesAssociated: ["phaseId005"] },
    { label: "Uses cognitive aids", phasesAssociated: ["phaseId005"] },
    { label: "Anticipates care required", phasesAssociated: ["phaseId005"] },
  ],
};
