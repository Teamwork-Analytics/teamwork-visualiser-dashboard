const { format } = require("date-fns");

const hiveTimeFormatter = (time) => {
  // NOT FINISHED YET!
  const startTime = Date.now();
  const phases = [Date.now(), Date.now() + 1000, Date.now() + 5000000];
  const result = phases.map((d) => {
    return d.valueOf() - startTime.valueOf();
  });
  result.forEach((r) => {
    const time = new Date(r);
    const offSetTime = time.getTimezoneOffset() * 60000;
    const finalTime = new Date(time.valueOf() + offSetTime);
    const message = format(finalTime, "HH:mm:ss");
    console.log(message);
  });

  console.log(result);

  if (typeof time !== Date) {
    throw new Error("time is not in Date format.");
  }
  const fakeTime = new Date();

  const hour = fakeTime.get;
  return;
};

const constructPhaseArray = () => {
  //stopTime
};
