import * as React from "react";
import * as Observation from "../../projects/observation/index";
import * as Hive from "../../projects/hive/index";
import * as Video from "../../projects/video/index";

type VizProviderProps = { children: React.ReactNode };

const VizContext = React.createContext<
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
  // NOT IN USED ATM
  // video: {
  //   label: "Video Player",
  //   mainView: <Video.VideoView />,
  // },
  "teamwork-vis": {
    label: "Teamwork Barchart",
  },
  "hive-vis": {
    label: "Position and Audio",
    mainView: <Hive.HiveView />,
    // primaryControlView: <Hive.HivePrimaryControlView />,
  },
  "audio-socnet-vis": {
    label: "Audio Social Network",
  },
};

function VizProvider({ children }: VizProviderProps) {
  const [tool, setTool] = React.useState(DEFAULT_VIEW);
  const value = { tool, setTool };
  return <VizContext.Provider value={value}>{children}</VizContext.Provider>;
}

function useViz() {
  const context = React.useContext(VizContext);
  if (context === undefined) {
    throw new Error("useViz must be used within a VizProvider");
  }
  return context;
}

export { VizProvider, useViz, availableTools };
