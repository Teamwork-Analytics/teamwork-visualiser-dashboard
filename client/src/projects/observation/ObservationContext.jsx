//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import * as React from "react";
import { sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";

const ObservationContext = React.createContext();

function ObservationProvider({ simulationId, children }) {
  const [notes, setNotes] = React.useState([]); // it is used to collect different phases
  const [observation, setObservation] = React.useState({
    synchronisations: [],
  });

  React.useEffect(() => {
    ObservationAPI.single(simulationId).then((res) => {
      if (res.status === 200) {
        setObservation(res.data);
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  }, []);

  const value = { notes, setNotes, observation, setObservation };
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
