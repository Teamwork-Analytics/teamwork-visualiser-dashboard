//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React, { useState } from "react";
import { sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import SimulationSessionAPI from "../../services/api/simulations";
import { toast } from "react-hot-toast";

const ObservationContext = React.createContext();

function ObservationProvider({ simulationId, children }) {
  const [notes, setNotes] = React.useState([]); // it is used to collect different phases
  const [observation, setObservation] = React.useState({
    synchronisations: [],
  });
  const [obsStartTime, setObsStartTime] = useState();
  const [obsEndTime, setObsEndTime] = useState();

  React.useEffect(() => {
    ObservationAPI.single(simulationId).then((res) => {
      if (res.status === 200) {
        setObservation(res.data);
        setObsStartTime(res.data.startTime);
        setObsEndTime(res.data.stopTime);
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  }, [simulationId]);

  const [isDataReady, setIsDataReady] = React.useState(false);
  React.useEffect(() => {
    SimulationSessionAPI.isReady(simulationId)
      .then((res) => {
        if (res.status === 200) {
          // const cleanedPhases = cleanRawPhases(phases);
          setIsDataReady(true);
        }
      })
      .catch((e) => {});
  }, [simulationId]);

  React.useEffect(() => {
    if (!isDataReady) {
      // Fetch data immediately when component mounts
      function fetchData() {
        SimulationSessionAPI.isReady(simulationId)
          .then((res) => {
            if (res.status === 200) {
              // const cleanedPhases = cleanRawPhases(phases);
              setIsDataReady(true);
            }
          })
          .catch((e) => {});
      }

      // Set up interval to fetch data every X milliseconds. Here, we use 5000ms (5 seconds) as an example.
      const intervalId = setInterval(fetchData, 10000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [isDataReady, simulationId]);

  const value = {
    notes,
    setNotes,
    observation,
    setObservation,
    obsStartTime,
    obsEndTime,
    isDataReady,
  };
  return (
    <ObservationContext.Provider value={value}>
      {children}
    </ObservationContext.Provider>
  );
}

function useObservation() {
  const context = React.useContext(ObservationContext);
  if (context === undefined) {
    throw new Error("useObservation must be used within a ObservationProvider");
  }
  return context;
}

export { ObservationProvider, useObservation };
