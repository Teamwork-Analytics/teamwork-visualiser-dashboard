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

const coordinatesForDebugging = [
  { label: "Resource_Phone", x: 8437, y: 4097, rad: 500 },
  { label: "Resource_IV1left", x: 0, y: 5693, rad: 1000 },
  { label: "Resource_IV2right", x: 0, y: 1038, rad: 1000 },
  { label: "B4_Centre", x: 6916, y: 1187, rad: 2000 },
  { label: "B1_Centre", x: 6060, y: 5957, rad: 2000 },
  { label: "B3_Centre", x: 2720, y: 1187, rad: 2000 },
  { label: "B2_Centre", x: 2443, y: 5957, rad: 2000 },
];

export { cleanRawPhases, coordinatesForDebugging };
