//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import * as React from "react";
import SimulationSessionsAPI from "../../services/api/simulations";

const MainContext = React.createContext([]);

function MainProvider({ children }) {
  const [simulations, setSimulations] = React.useState([]);

  React.useEffect(() => {
    SimulationSessionsAPI.index().then((res) => {
      if (res.status === 200) {
        setSimulations(res.data);
      }
    });
  }, []);

  const value = { simulations, setSimulations };
  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
}

function useMain() {
  const context = React.useContext(MainContext);
  if (context === undefined) {
    throw new Error("useMain must be used within a MainProvider");
  }
  return context;
}

export { MainProvider, useMain };
