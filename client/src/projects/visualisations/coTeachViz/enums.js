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

const CoTeachToolTips = {
  "one-teacher-one-observer":
    "One teacher leads the lesson while the other observes and takes notes on student performance and engagement.",
  "one-teacher-one-assistant":
    "One teacher leads the lesson while the other assists students, provides support, and helps manage the classroom.",
  "parallel-teaching":
    "The class is split into two groups, and both teachers simultaneously teach the same content to their respective groups.",
  "alternative-teaching":
    "One teacher leads the main lesson with the larger group, while the other teacher works with a smaller group for specialized instruction or enrichment.",
  "team-teaching":
    "Both teachers collaboratively plan and deliver the lesson together, sharing equal responsibility for instruction.",
};

export {
  TeacherEnums,
  TeacherBackEndEnums,
  SpatialPedEnums,
  PedagogyMapEnums,
  CoTeachToolTips,
};
