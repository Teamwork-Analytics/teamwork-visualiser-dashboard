/**
 * @file TimelieContext.jsx
 * @description This file contains the context for the timeline component.It
 * is used to manage time selected to sync between all timeline
 * @reference https://kentcdodds.com/blog/how-to-use-react-context-effectively
 */

import * as React from "react";

const TimelineContext = React.createContext();

function TimelineProvider({ children }) {
  const [currentPosition, setCurrentPosition] = React.useState(0); // position of the slider time in seconds

  const value = { currentPosition, setCurrentPosition };
  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

function useTimeline() {
  const context = React.useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}

export { TimelineProvider, useTimeline };
