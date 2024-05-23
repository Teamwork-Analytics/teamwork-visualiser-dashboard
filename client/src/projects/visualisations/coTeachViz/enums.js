const TeacherEnums = Object.freeze({
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE",
});

const TeacherBackEndEnums = Object.freeze({
  R: "RED",
  G: "GREEN",
  B: "BLUE",
});

// const SpatialPedagogyOrder = Object.freeze({
//   authoritative: { lecturing: 1, assisting: 2 },
//   supervisory: { monitoring: 1, surveillance: 2 },
//   interactional: {
//     "1-1 student teacher interaction": 1,
//     "teacher-teacher interaction": 2,
//   },
//   personal: { personal: 1, watching: 2 },
// });

const SpatialPedEnums = Object.freeze({
  AUTHORITATIVE: "authoritative",
  SUPERVISORY: "supervisory",
  INTERACTIONAL: "interactional",
  PERSONAL: "personal",
});

const PedagogyMapEnums = Object.freeze({
  authoritative: ["lecturing", "assisting"],
  supervisory: ["monitoring", "surveillance"],
  interactional: [
    "1-1 student teacher interaction",
    "teacher-teacher interaction",
  ],
  personal: ["personal", "watching"],
});

export { TeacherEnums, TeacherBackEndEnums, SpatialPedEnums, PedagogyMapEnums };
