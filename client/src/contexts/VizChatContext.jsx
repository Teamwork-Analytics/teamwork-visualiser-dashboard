//Create a context for VizChat controllable information: such as
// * take screenshot of a canvas
// *

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from "react";
import exportAsImage from "../helper/Screenshot";

const VizChatContext = React.createContext({});

function VizChatProvider({ children }) {
  const [vizChatState, vizChatSetState] = React.useState({
    title: "",
    userId: "",
    simulationId: "",
  });

  const takeScreenShot = async (reference) => {
    await exportAsImage(reference);
    //TODO: send it to the API
  };

  const value = {
    vizChatState,
    vizChatSetState,
    takeScreenShot,
  };

  return (
    <VizChatContext.Provider value={value}>{children}</VizChatContext.Provider>
  );
}

function useVizChat() {
  const context = React.useContext(VizChatContext);
  if (context === undefined) {
    throw new Error("useVizChat must be used within a HiveProvider");
  }
  return context;
}

export { VizChatProvider, useVizChat };
