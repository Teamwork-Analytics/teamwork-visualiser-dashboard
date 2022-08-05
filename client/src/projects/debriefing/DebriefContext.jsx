//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

import * as React from "react";

const DebriefingContext = React.createContext();

function DebriefingProvider({ children }) {
  const [isStarted, setIsStarted] = React.useState(false);

  const value = { isStarted, setIsStarted };
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
