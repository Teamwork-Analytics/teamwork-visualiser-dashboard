const COLOUR_LABELS = {
  peninsulaNursing: {
    RED: "PN1",
    BLUE: "PN2",
    GREEN: "SN1",
    YELLOW: "SN2",
  },
  classroomAnalytics2024: {
    RED: "TA1",
    BLUE: "TA2",
    GREEN: "TA3",
    YELLOW: "NA",
  },
};

const DEFAULT_HIVE_STATE = {
  participants: { RED: true, BLUE: true, GREEN: true, YELLOW: true },
  phase: [0, 100],
  isPositionOnly: false,
};

const PHASES = {
  peninsulaNursing: [
    "Start",
    "Handover",
    "Bed 4 emergency",
    "Ward nurses start",
    "MET doctor start",
    "End",
  ],
  classroomAnalytics2024: [
    "1. Welcome",
    "2. Assignment 1 reminder",
    "3a. Relational Model recap",
    "3b. Choosing primary key",
    "4. Relational algebra exercise",
    "5. Additional relational algebra exercise",
  ],
};
const CLASSROOM_SIZE = {
  peninsulaNursing: {
    WIDTH: 9500,
    HEIGHT: 6960,
  },
  classroomAnalytics2024: {
    WIDTH: 13550,
    HEIGHT: 12090,
  },
};

const HIVE_CONSTANTS = {
  peninsulaNursing: {
    HEX_RADIUS: 50,
    IMG_WIDTH: 2297,
    IMG_HEIGHT: 1715,
    X_ADJUSTMENT: 0,
    Y_ADJUSTMENT: 0,
    HEXAGON_OPACITY: "0.5",
  },
  classroomAnalytics2024: {
    HEX_RADIUS: 30,
    IMG_WIDTH: 2140,
    IMG_HEIGHT: 1889,
    X_ADJUSTMENT: 60,
    Y_ADJUSTMENT: 0,
    HEXAGON_OPACITY: "0.5",
  },
};

export {
  COLOUR_LABELS,
  DEFAULT_HIVE_STATE,
  PHASES,
  CLASSROOM_SIZE,
  HIVE_CONSTANTS,
};
