/**
 * @file TimelineContext.jsx
 * @description This context manages the state and behavior for timeline-related functionality, including the playhead position, the time range, simulation duration, and timeline tags. It also provides undo/redo functionality.
 *
 * @references
 * - For useContext: https://kentcdodds.com/blog/how-to-use-react-context-effectively
 * - For undo and redo:
 *   - https://www.linkedin.com/pulse/implementing-undo-redo-functionality-react-apps-components-alex-lomia/
 *   - https://medium.com/geekculture/react-hook-to-allow-undo-redo-d9d791c5cd94
 */

import * as React from "react";
import { useObservation } from "../ObservationContext";

// Create TimelineContext
const TimelineContext = React.createContext();

/**
 * Helper function to calculate duration between start and end times
 * @param {string} startTime - The start time
 * @param {string} endTime - The end time
 * @returns {number} The duration in seconds
 */
const calculateDuration = (startTime, endTime) => {
  return Math.round(Math.abs(new Date(endTime) - new Date(startTime)) / 1000);
};

/**
 * Helper function to compare two arrays for equality
 * @param {Array} a - First array to compare
 * @param {Array} b - Second array to compare
 * @returns {boolean} - Returns true if the arrays are equal, false otherwise
 */
const arraysAreEqual = (a, b) => {
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

function TimelineProvider({ children }) {
  const { notes, obsStartTime, obsEndTime } = useObservation();

  // Define simulation start, end, and duration
  const simStartTimestamp = obsStartTime;
  const simEndTimestamp = obsEndTime;
  const simDuration = calculateDuration(simStartTimestamp, simEndTimestamp);

  // State and effect for timeline tags, mapped from notes
  const [timelineTags, setTimelineTags] = React.useState([]);
  React.useEffect(() => {
    setTimelineTags(
      notes.map((note) => {
        const value = calculateDuration(simStartTimestamp, note.timestamp);
        const label = note.message;
        return { value, label };
      })
    );
  }, [notes, simStartTimestamp]);

  // State for play-head position
  const [playHeadPosition, setPlayHeadPosition] = React.useState(0);

  // States and effect for history, current index, range and setRange for undo/redo functionality
  const [historyRanges, setHistoryRanges] = React.useState([[0, simDuration]]);
  const [index, setIndex] = React.useState(0);
  const range = React.useMemo(
    () => historyRanges[index],
    [historyRanges, index]
  );

  // SetRange function using array comparison
  const setRange = (value) => {
    if (arraysAreEqual(range, value)) {
      return;
    }
    const copy = historyRanges.slice(0, index + 1);
    copy.push(value);
    setHistoryRanges(copy);
    setIndex(copy.length - 1);
  };

  // Undo function
  const undoTimeline = (steps = 1) => {
    setIndex(Math.max(0, Number(index) - (Number(steps) || 1)));
  };

  // Redo function
  const redoTimeline = (steps = 1) => {
    setIndex(
      Math.min(historyRanges.length - 1, Number(index) + (Number(steps) || 1))
    );
  };

  // Value to be provided by context
  const value = {
    playHeadPosition,
    setPlayHeadPosition,
    range,
    setRange,
    simDuration,
    timelineTags,
    setTimelineTags,
    index,
    lastIndex: historyRanges.length - 1,
    undoTimeline,
    redoTimeline,
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
