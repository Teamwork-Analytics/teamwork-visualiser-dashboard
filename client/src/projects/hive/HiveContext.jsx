//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import * as React from "react";

const HiveContext = React.createContext();
const RAW_PHASES = [
  { label: <i>Start</i>, time: "0:00:01" },
  { label: "Handover", time: "0:04:57" },
  { label: "Start emergency in Bed 4", time: "0:07:34" },
  { label: "MET call", time: "0:17:35" },
  { label: "Doctor In", time: "0:23:55" },
  { label: <i>End</i>, time: "0:33:10" },
];

const timeToPercentage = (phases) => {
  const dataInSec = phases.map((d) => {
    return { ...d, markers: Date.parse(`1 Jan 1970 ${d.time} GMT`) };
  });
  const totalDuration = dataInSec[dataInSec.length - 1].markers;
  return dataInSec.map((d) => {
    return { ...d, markers: Math.round((d.markers / totalDuration) * 100) };
  });
};

function HiveProvider({ children }) {
  const [state, setState] = React.useState({
    participants: { RED: true, BLUE: true, YELLOW: true, GREEN: true },
    phase: 100,
    isPositionOnly: false,
  });

  const markers = timeToPercentage(RAW_PHASES).reduce(
    (o, curr) => ({ ...o, [curr.markers]: curr }),
    {}
  );

  const value = { state, setState, markers };
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
