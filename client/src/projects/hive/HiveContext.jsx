//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import * as React from "react";

const HiveContext = React.createContext();

function HiveProvider({ children }) {
  const [state, setState] = React.useState({
    participants: { RED: true, BLUE: true, YELLOW: true, GREEN: true },
    phase: 4,
    isPositionOnly: false,
  });
  const phases = [
    { label: <strong>Start</strong>, time: "0:00:01" },
    { label: "Handover", time: "0:04:57" },
    { label: "Bed 4", time: "0:07:34" },
    { label: "MET call", time: "0:17:35" },
    { label: "Doctor In", time: "0:23:55" },
    { label: <strong>End</strong>, time: "0:33:10" },
  ];
  const value = { state, setState, phases };
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
