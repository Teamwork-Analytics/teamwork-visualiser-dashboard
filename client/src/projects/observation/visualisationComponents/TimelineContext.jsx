/**
 * @file TimelieContext.jsx
 * @description This file contains the context for the timeline component.It
 * is used to manage time selected to sync between all timeline
 * @reference https://kentcdodds.com/blog/how-to-use-react-context-effectively
 */

import * as React from "react";
import { useObservation } from "../ObservationContext";

const TimelineContext = React.createContext();

const calculateDuration = (startTime, endTime) => {
  return Math.round(Math.abs(new Date(endTime) - new Date(startTime)) / 1000);
};

function TimelineProvider({ children }) {
  // TODO: use hard coded start time and end time here for now
  const { notes } = useObservation();
  const simStartTimestamp = "2023-06-01T00:09:38.357Z";
  const simEndTimestamp = "2023-06-01T00:25:44.896Z";
  const simDuration = calculateDuration(simStartTimestamp, simEndTimestamp);

  const [timelineTags, setTimelineTags] = React.useState(
    notes.map((note) => {
      const value = calculateDuration(simStartTimestamp, note.timestamp);
      const label = note.message; // or any other property you want to show as label
      return { value, label };
    })
  ); // notes that have been processed to be displayed on the timeline
  const [range, setRange] = React.useState([0, 20]); // range of the slider time in seconds
  const [playHeadPosition, setPlayHeadPosition] = React.useState(range[0]); // position of the slider time in seconds

  const value = {
    playHeadPosition,
    setPlayHeadPosition,
    range,
    setRange,
    simDuration,
    timelineTags,
    setTimelineTags,
  };
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
