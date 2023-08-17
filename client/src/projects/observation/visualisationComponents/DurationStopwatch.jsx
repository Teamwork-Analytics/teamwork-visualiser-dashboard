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
 * StopwatchComponent
 * Renders the main stopwatch display.
 *
 * @param {Date} stopwatchOffset - The date object offset for the stopwatch.
 * @param {Boolean} autoStart - Determines if the stopwatch should start automatically.
 */
const StopwatchComponent = ({ stopwatchOffset, autoStart, onReady }) => {
  const { seconds, minutes, start, pause } = useStopwatch({
    autoStart,
    offsetTimestamp: stopwatchOffset,
  });

  useEffect(() => {
    if (onReady) onReady({ start, pause });
  }, [onReady, start, pause]);

  return <div>{"Duration: " + minutes + ":" + seconds}</div>;
};

/**
 * DurationStopwatch
 * Main stopwatch component that decides which type of stopwatch to render based on observation times.
 */
const DurationStopwatch = ({ onReady }) => {
  const { obsStartTime, obsEndTime } = useObservation();

  if (obsStartTime && obsEndTime) {
    return <EndedStopwatch startTime={obsStartTime} endTime={obsEndTime} />;
  } else if (obsStartTime) {
    return <RunningStopwatch startTime={obsStartTime} onReady={onReady} />;
  } else {
    return <ReadyStopwatch onReady={onReady} />;
  }
};

/**
 * EndedStopwatch
 * Renders a stopwatch showing duration between start and end times.
 */
const EndedStopwatch = ({ startTime, endTime }) => {
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  const offsetDate = new Date();
  offsetDate.setMilliseconds(offsetDate.getMilliseconds() + diff);

  return <StopwatchComponent stopwatchOffset={offsetDate} autoStart={false} />;
};

/**
 * RunningStopwatch
 * Renders a running stopwatch from the start time till now.
 */
const RunningStopwatch = ({ startTime, onReady }) => {
  const diff = new Date().getTime() - new Date(startTime).getTime();
  const offsetDate = new Date();
  // ! Please constantly check the library documentation for possible changes
  // ! in the ways of calculating offset time.
  offsetDate.setMilliseconds(offsetDate.getMilliseconds() + diff);

  return (
    <StopwatchComponent
      stopwatchOffset={offsetDate}
      autoStart={true}
      onReady={onReady}
    />
  );
};
/**
 * ReadyStopwatch
 * Renders a stopwatch ready to be started.
 */
const ReadyStopwatch = ({ onReady }) => {
  return <StopwatchComponent autoStart={false} onReady={onReady} />;
};

export default DurationStopwatch;
