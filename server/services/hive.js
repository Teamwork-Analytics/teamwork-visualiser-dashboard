const observationServices = require("../services/observation");

const { format } = require("date-fns");

const constructPhasesArrayFromObservation = async (obsId) => {
  let result = [];
  const obs = await observationServices.single(observationId);
  const { startTime, stopTime, phases } = obs;
  if (phases.length === 0) {
    throw new Error("Phases are empty");
    return result;
  }
  const start = { label: "Start", timestamp: startTime };
  const stop = { label: "End", timestamp: stopTime };
  const constructedPhases = phases.map((p) => {
    return { label: p.message, timestamp: p.timestamp };
  });

  const fullPhases = [start, ...constructedPhases, stop];

  const durationPhases = fullPhases.map((d) => {
    return d.valueOf() - startTime.valueOf();
  });

  result = durationPhases.map((r) => {
    const time = new Date(r);
    const offSetTime = time.getTimezoneOffset() * 60000;
    const finalTime = new Date(time.valueOf() + offSetTime);
    const message = format(finalTime, "HH:mm:ss");
    return message;
  });

  console.log(result);
  return result;
};

module.exports = { constructPhasesArrayFromObservation };
