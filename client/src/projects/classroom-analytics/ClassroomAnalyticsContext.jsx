/**
 * Specific project to Classroom Analytics to visualise Location & Audio data.
 */

import React, { useEffect } from "react";
import HiveAPI from "../../services/api/hive";
import { DEFAULT_HIVE_STATE } from "./constants";

const ClassroomAnalyticsContext = React.createContext();

function ClassroomAnalyticsProvider({ simulationId, children }) {
  const [pageState, setPageState] = React.useState(DEFAULT_HIVE_STATE);
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
    }
  }, [isHiveReady, simulationId]);

  const value = {
    pageState,
    setPageState,
    isHiveReady,
  };

  return (
    <ClassroomAnalyticsContext.Provider value={value}>
      {children}
    </ClassroomAnalyticsContext.Provider>
  );
}

function useClassroomAnalytics() {
  const context = React.useContext(ClassroomAnalyticsContext);
  if (context === undefined) {
    throw new Error("useClassroomAnalytics must be used within a HiveProvider");
  }
  return context;
}

export { ClassroomAnalyticsProvider, useClassroomAnalytics };
