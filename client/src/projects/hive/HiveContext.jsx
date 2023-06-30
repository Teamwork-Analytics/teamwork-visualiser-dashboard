//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import * as React from "react";
import HiveAPI from "../../services/api/hive";
import { cleanRawPhases } from "./utils";

const HiveContext = React.createContext();

function HiveProvider({ simulationId, children }) {
  const [hiveState, hiveSetState] = React.useState({
    participants: { RED: true, BLUE: true, YELLOW: true, GREEN: true },
    phase: [0, 100],
    isPositionOnly: false,
  });
  const [markers, setMarkers] = React.useState([]);

  const value = {
    hiveState,
    hiveSetState,
    markers,
    setMarkers,
  };
  return <HiveContext.Provider value={value}>{children}</HiveContext.Provider>;
}

function useHive() {
  const context = React.useContext(HiveContext);
  if (context === undefined) {
    throw new Error("useHive must be used within a HiveProvider");
  }
  return context;
}

export { HiveProvider, useHive };
