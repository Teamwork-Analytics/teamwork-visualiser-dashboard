/**
 * @file NurseNameContext.jsx
 * @description This context manages the state and behavior for nurse names, including getting and updating the names of the nurses. The names are obtained and updated via the PrivateNoteAPI.
 */

import * as React from "react";
import { useParams } from "react-router-dom";
import PrivateNoteAPI from "../../../shared/services/api/privateNote";

// Create NurseNamesContext
const NurseNameContext = React.createContext();

function NurseNameProvider({ children }) {
  const simulationId = useParams().simulationId;
  const [nurseNames, setNurseNames] = React.useState({});

  // Fetch and set nurse names on component mount and whenever simulationId changes
  React.useEffect(() => {
    PrivateNoteAPI.get(simulationId).then((res) => {
      if (res.status === 200) {
        setNurseNames(res.data.nurses);
      }
    });
  }, [simulationId]);

  // Function for updating a nurse name and making the relevant API call
  const updateNurseName = (nurseType, newName) => {
    let updatedNurseNames = { ...nurseNames };
    updatedNurseNames[nurseType] = newName;
    PrivateNoteAPI.update(simulationId, updatedNurseNames)
      .then((res) => {
        if (res.status === 200) {
          setNurseNames(res.data.nurses);
        }
      })
      .catch((err) => console.error(err));
  };

  // Value to be provided by context
  const value = {
    nurseNames,
    updateNurseName,
  };

  return (
    <NurseNameContext.Provider value={value}>
      {children}
    </NurseNameContext.Provider>
  );
}

function useNurseName() {
  const context = React.useContext(NurseNameContext);
  if (context === undefined) {
    throw new Error("useNurseNames must be used within a NurseNamesProvider");
  }
  return context;
}

export { NurseNameProvider, useNurseName };
