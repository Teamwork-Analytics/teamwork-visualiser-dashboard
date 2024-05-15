//Create a context for HIVE controllable information: such as
// * change person (select checkboxes)
// * switch between overall to different phases (with slider)
// * with audio (default) or position only

// GUIDE: https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React, { useEffect } from "react";

const CoTeachVizContext = React.createContext();

function CoTeachVizProvider({ children }) {
  const [coTeachVizState, coTeachVizSetState] = React.useState({
    all: true,
    red: false,
    green: false,
    blue: false,
    authoritative: false,
    supervisory: false,
    interactional: false,
    personal: false,
  });

  const changeColour = (filter) => {
    coTeachVizSetState((prevState) => {
      const updatedState = { ...prevState };

      // Set all other filter states to false
      Object.keys(updatedState).forEach((key) => {
        if (key !== filter) {
          updatedState[key] = false;
        }
      });

      // Toggle the clicked filter state
      updatedState[filter] = true;

      return updatedState;
    });
    // setCurrentFilter(filter);
    // setIsActive(!isActive);
    // setColourState(isActive ? DEFAULT_COLOUR : colourHex);
    // setFontColour(isActive ? DEFAULT_FONT_COLOUR : "white");
  };
  const value = {
    coTeachVizState,
    coTeachVizSetState,
    changeColour,
  };

  return (
    <CoTeachVizContext.Provider value={value}>
      {children}
    </CoTeachVizContext.Provider>
  );
}

function useCoTeachViz() {
  const context = React.useContext(CoTeachVizContext);
  if (context === undefined) {
    throw new Error("useHive must be used within a HiveProvider");
  }
  return context;
}

export { CoTeachVizProvider, useCoTeachViz };
