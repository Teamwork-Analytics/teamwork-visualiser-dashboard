/**
 * @file DurationStopwatch.jsx
 *
 * @description This component provides a stopwatch functionality for various observation scenarios.
 * It can show durations between a start and end time, a running stopwatch from a start time,
 * or a stopwatch that's ready to be started.
 *
 * @dependencies
 * - react-timer-hook: Provides the main stopwatch functionality.
 * - ObservationContext: Supplies observation start and end times.
 */

import { useStopwatch } from "react-timer-hook";
import { useObservation } from "../ObservationContext";
import { useEffect } from "react";

/**
 * @function calculateOffset
 * Utility function to calculate the offset for the stopwatch.
 * !! Please constantly check the library documentation for possible changes
 * !! in the ways of calculating offset time.
 */
const calculateOffset = (startTime, endTime = new Date()) => {
  const diff = endTime.getTime() - new Date(startTime).getTime();
  const offsetDate = new Date();
  offsetDate.setMilliseconds(offsetDate.getMilliseconds() + diff);
  return offsetDate;
};

/**
 * StopwatchComponent
 * Renders the main stopwatch display.
 *
 * @param {Date} stopwatchOffset - The date object offset for the stopwatch.
 * @param {Boolean} autoStart - Determines if the stopwatch should start automatically.
 */
const StopwatchComponent = ({ stopwatchOffset, autoStart }) => {
  const { seconds, minutes } = useStopwatch({
    autoStart,
    offsetTimestamp: stopwatchOffset,
  });

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return <div>{`Duration: ${formattedMinutes}:${formattedSeconds}`}</div>;
};

/**
 * DurationStopwatch
 * Main stopwatch component that decides which type of stopwatch to render based on observation times.
 */
const DurationStopwatch = () => {
  const { obsStartTime, obsEndTime, toggleRefreshSim } = useObservation();

  useEffect(() => {
    if (!obsStartTime) {
      const interval = setInterval(() => {
        console.log("refresh triggered -- duration stopwatch");
        toggleRefreshSim();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval); // Cleanup on component unmount
    }
  }, [obsStartTime, toggleRefreshSim]);

  if (obsStartTime && obsEndTime) {
    return <EndedStopwatch startTime={obsStartTime} endTime={obsEndTime} />;
  } else if (obsStartTime) {
    return <RunningStopwatch startTime={obsStartTime} />;
  }

  return <ReadyStopwatch />;
};

/**
 * EndedStopwatch
 * Renders a stopwatch showing duration between start and end times.
 */
const EndedStopwatch = ({ startTime, endTime }) => {
  const offsetDate = calculateOffset(startTime, new Date(endTime));
  return <StopwatchComponent stopwatchOffset={offsetDate} autoStart={false} />;
};

/**
 * RunningStopwatch
 * Renders a running stopwatch from the start time till now.
 */
const RunningStopwatch = ({ startTime }) => {
  const offsetDate = calculateOffset(startTime);
  return <StopwatchComponent stopwatchOffset={offsetDate} autoStart={true} />;
};

/**
 * ReadyStopwatch
 * Renders a stopwatch ready to be started.
 */
const ReadyStopwatch = () => {
  return <StopwatchComponent autoStart={false} />;
};

export default DurationStopwatch;
