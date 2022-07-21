export const fakeSessions = [
  {
    sessionId: "181",
    name: "18 Aug 2021 - 3pm",
    project: "Peninsula Nursing Simulation",
  },
  {
    sessionId: "189",
    name: "24 Aug 2021 - 9am",
    project: "Peninsula Nursing Simulation",
  },
  {
    sessionId: "147",
    name: "Session 3",
  },
  {
    sessionId: "148",
    name: "Session 4",
  },
  {
    sessionId: "149",
    name: "Session 5",
  },
  {
    sessionId: "150",
    name: "Session 6",
  },
  {
    sessionId: "151",
    name: "Session 7",
  },
];

export const fakeParticipants = [
  { colour: "RED", hasAudio: true },
  { colour: "BLUE", hasAudio: false },
  { colour: "GREEN", hasAudio: true },
  { colour: "YELLOW", hasAudio: true },
];

export const fakeSessionContext = {
  // [start, ...phases, end]
  181: {
    hive: {
      phases: [
        "0:00:01",
        "0:04:20",
        "0:06:02",
        "0:11:40",
        "0:21:06",
        "0:27:30",
      ],
    },
  },
  189: {
    hive: {
      phases: [
        "0:00:01",
        "0:03:22",
        "0:04:21",
        "0:09:46",
        "0:13:43",
        "0:20:23",
      ],
    },
  },
};
