const timeToPercentage = (phases) => {
  const dataInSec = phases.map((d) => {
    return { ...d, markers: Date.parse(`1 Jan 1970 ${d.timestamp} GMT`) };
  });
  const totalDuration = dataInSec[dataInSec.length - 1].markers;
  return dataInSec.map((d) => {
    return { ...d, markers: Math.round((d.markers / totalDuration) * 100) };
  });
};

const labels = [
  "Start",
  "Handover",
  "Bed 4 emergency",
  "Ward nurses start",
  "MET doctor start",
  "End",
];

const cleanRawPhases = (phases) => {
  //phases format: ["0:04:32","0:12:12",...]
  if (phases.length === 0) return [];

  const labeledPhases = phases.map((time, i) => {
    return {
      label: labels[i] + ": " + time,
      timestamp: time,
    };
  });

  return timeToPercentage(labeledPhases).reduce(
    (o, curr) => ({ ...o, [curr.markers]: curr }),
    {}
  );
};

export { cleanRawPhases };
