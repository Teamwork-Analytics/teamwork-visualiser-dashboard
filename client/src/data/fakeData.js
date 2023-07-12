
export const fakeProjects = [
  { projectId: "002", name: "Clayton Nursing Simulation" },
  { projectId: "001", name: "Peninsula Nursing Simulation" },
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
        "0:00:00",
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
        "0:00:00",
        "0:03:22",
        "0:04:21",
        "0:09:46",
        "0:13:43",
        "0:20:23",
      ],
    },
  },
};

export const fakeDevicesData = [
  { name: "empatica red", id: "a", time: undefined },
  { name: "empatica blue", id: "b", time: Date.now() },
  { name: "empatica green", id: "c", time: Date.now() },
  { name: "empatica yellow", id: "d", time: Date.now() },
  { name: "video", id: "e", time: undefined },
  { name: "fitbit", id: "f", time: Date.now() },
];
