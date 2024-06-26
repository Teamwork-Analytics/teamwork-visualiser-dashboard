//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React, { useEffect } from "react";
import HiveAPI from "../../services/api/hive";

const HiveContext = React.createContext();

function HiveProvider({ simulationId, children }) {
  const [hiveState, hiveSetState] = React.useState({
    participants: { BLUE: true, RED: true, GREEN: true, YELLOW: true },
    phase: [0, 100],
    isPositionOnly: false,
  });
  const [isHiveReady, setIsReady] = React.useState(false);
  useEffect(() => {
    HiveAPI.isDataReady(simulationId)
      .then((res) => {
        if (res.status === 200) {
          // const cleanedPhases = cleanRawPhases(phases);
          setIsReady(true);
        }
      })
      .catch((e) => {});
  }, [simulationId]);

  useEffect(() => {
    if (!isHiveReady) {
      // Fetch data immediately when component mounts
      function fetchData() {
        HiveAPI.isDataReady(simulationId)
          .then((res) => {
            if (res.status === 200) {
              // const cleanedPhases = cleanRawPhases(phases);
              setIsReady(true);
            }
          })
          .catch((e) => {});
      }

      // Set up interval to fetch data every X milliseconds. Here, we use 5000ms (5 seconds) as an example.
      const intervalId = setInterval(fetchData, 10000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [isHiveReady, simulationId]);

  const value = {
    hiveState,
    hiveSetState,
    isHiveReady,
  };

  return <HiveContext.Provider value={value}>{children}</HiveContext.Provider>;
}

function useHive() {
  const context = React.useContext(HiveContext);
  if (context === undefined) {
    throw new Error("useHive must be used within a HiveProvider");
  }
  return context;
}

export { HiveProvider, useHive };
