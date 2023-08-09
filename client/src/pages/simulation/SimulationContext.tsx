import * as React from "react";
import * as Observation from "../../projects/observation/index";
import * as Debrief from "../../projects/debriefing-projection/index";

type SimProviderProps = {
  children: React.ReactNode;
};

const SimContext = React.createContext<
  { tool: String; setTool: Function } | undefined
>(undefined);
const DEFAULT_VIEW = "observation";

/**
 * availableTools is a strategy variable
 */
const availableTools: any = {
  observation: {
    label: "Observation",
    mainView: <Observation.ObservationView />,
    primaryControlView: <Observation.ObservationPrimaryControlView />,
    secondaryControlView: <Observation.ObservationSecondaryControlView />,
  },
  debrief: {
    label: "Debriefing",
    mainView: <Debrief.DebriefView />,
    primaryControlView: <Debrief.DebriefPrimaryControlView />,
  },
  // visualisation: {
  //   label: "Visualisations",
  //   mainView: <Visualisation.VisualisationView />,
  //   primaryControlView: <Visualisation.VisualisationControlView />,
  //   secondaryControlView: <Visualisation.HiveLegendView />,
  // },
};

function SimProvider({ children }: SimProviderProps) {
  const [tool, setTool] = React.useState(DEFAULT_VIEW);

  const value = { tool, setTool };
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

function useSimulation() {
  const context = React.useContext(SimContext);
  if (context === undefined) {
    throw new Error("useViz must be used within a VizProvider");
  }
  return context;
}

export { SimProvider, useSimulation, availableTools };
