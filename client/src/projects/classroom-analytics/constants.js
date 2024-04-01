const COLOUR_LABELS = {
  RED: "TA1",
  BLUE: "TA2",
  GREEN: "TA3",
};

const DEFAULT_HIVE_STATE = {
  participants: { RED: true, BLUE: true, GREEN: true },
  phase: [0, 100],
  isPositionOnly: false,
};

const PHASES = [
  "Start",
  "Handover",
  "Bed 4 emergency",
  "Ward nurses start",
  "MET doctor start",
  "End",
];

const CLASSROOM_SIZE = {
  WIDTH: 9500,
  HEIGHT: 6960,
};

const HIVE_CONSTANTS = {
  HEX_RADIUS: 50,
  IMG_WIDTH: 2297,
  IMG_HEIGHT: 1715,
  HEXAGON_OPACITY: "0.5",
};

export {
  COLOUR_LABELS,
  DEFAULT_HIVE_STATE,
  PHASES,
  CLASSROOM_SIZE,
  HIVE_CONSTANTS,
};
