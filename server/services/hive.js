const { format } = require("date-fns");
const simService = require("./simulation");
const obsService = require("./observation");

const _timeToPercentage = (phases) => {
  const dataInSec = phases.map((d) => {
    return { ...d, markers: Date.parse(`1 Jan 1970 ${d.timestamp} GMT`) };
  });
  const totalDuration = dataInSec[dataInSec.length - 1].markers;
  return dataInSec.map((d) => {
    return { ...d, markers: Math.round((d.markers / totalDuration) * 100) };
  });
};

const _calculateTimeStamp = (d, startTime) => {
  // if (d.timestamp == null || startTime == null) return Date.now;
  return d.timestamp.valueOf() - startTime.valueOf();
};

const constructPhasesArrayFromObservation = async (simId) => {
  let result = [];
  const sim = await simService.singleBySimulationId(simId);
  const obs = await obsService.single(sim.observation);

  const { startTime, stopTime, phases } = obs;
  // when there're no phases
  if (phases.length === 0) {
    return [];
  }

  //prepare all data
  const start = { label: "Start", timestamp: startTime };
  const stop = { label: "End", timestamp: stopTime };
  const constructedPhases = phases.map((p) => {
    return { label: p.message, timestamp: p.timestamp };
  });

  // construct an array
  const fullPhases = [start, ...constructedPhases, stop];

  // get duration only.
  const durationPhases = fullPhases.map((d) => {
    return {
      label: d.label,
      timestamp: _calculateTimeStamp(d, startTime),
    };
  });

  const formattedPhases = durationPhases.map((d) => {
    const time = new Date(d.timestamp);
    const offSetTime = time.getTimezoneOffset() * 60000;
    const finalTime = new Date(time.valueOf() + offSetTime);
    const formattedTime = format(finalTime, "HH:mm:ss");
    return { label: `${d.label} ${formattedTime}`, timestamp: formattedTime };
  });
  result = _timeToPercentage(formattedPhases).reduce(
    (o, curr) => ({ ...o, [curr.markers]: curr }),
    {}
  );

  return result;
};

module.exports = { constructPhasesArrayFromObservation };
