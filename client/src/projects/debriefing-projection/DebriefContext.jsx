//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

import React, { useState, useEffect } from "react";
import { getSNAdata } from "../../services/py-server";

const DebriefingContext = React.createContext();

function DebriefingProvider({ simulationId, children }) {
  const [isStarted, setIsStarted] = React.useState(false);
  // const [enaData, setENAdata] = useState([]);
  const [snaData, setSNAdata] = useState([]);
  // const [networkENAData, setNetworkENAData] = useState([]);

  /* getData from backend */
  // useEffect(() => {
  //   getENAdata(simulationId).then((res) => {
  //     if (res.status === 200) {
  //       // const cleanedPhases = cleanRawPhases(phases);
  //       setENAdata(res.data);
  //     }
  //   });
  // }, [simulationId]);

  useEffect(() => {
    getSNAdata(simulationId)
      .then((res) => {
        if (res.status === 200) {
          // const cleanedPhases = cleanRawPhases(phases);
          setSNAdata(res.data);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  // useEffect(() => {
  //   try {
  //     const net_data = processing_adjacent_matrix(enaData);
  //     if (enaData.length !== 0) {
  //       setNetworkENAData(net_data["nodes"].concat(net_data["edges"]));
  //     }
  //   } catch (err) {
  //     toast.error(`SNA error: unable to change visualisation based on time`);
  //     console.error(err);
  //   }
  // }, [enaData]);

  const value = { isStarted, setIsStarted, snaData };
  return (
    <DebriefingContext.Provider value={value}>
      {children}
    </DebriefingContext.Provider>
  );
}

function useDebriefing() {
  const context = React.useContext(DebriefingContext);
  if (context === undefined) {
    throw new Error("useDebriefing must be used within a DebriefingProvider");
  }
  return context;
}

export { DebriefingProvider, useDebriefing };
