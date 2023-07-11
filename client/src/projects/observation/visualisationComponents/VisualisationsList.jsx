import TimelineVisualisation from "./TimelineVisualisation";
import VideoVisualisation from "./VideoVisualisation";

// visualisations
import { ENANetworkView, SocialNetworkView } from "../../communication";
import { HiveView } from "../../hive";
import TeamworkBarchart from "../../teamwork/TeamworkBarchart";

const visStyles = {
  imageContainer: {
    width: "auto",
    objectFit: "scale-down",
    maxHeight: "33vh",
  },
  activeTab: {
    backgroundColor: "white",
    color: "black",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "lightgrey",
    borderRadius: "0.25rem",
    fontSize: "14px",
    padding: "5px",
  },
  inactiveTab: { color: "gray", fontSize: "14px", padding: "5px" },
};

// Top tab visualisation list
const topTabVisualisations = [
  {
    eventKey: "timeline",
    title: "Timeline",
    component: (style) => (
      <TimelineVisualisation
        style={{ ...style, ...visStyles.imageContainer }}
      />
    ),
    tabAttrs: (topActiveTab) => ({
      style:
        topActiveTab === "timeline"
          ? visStyles.activeTab
          : visStyles.inactiveTab,
    }),
  },
  {
    eventKey: "video",
    title: "Video",
    component: (style, isVideoTabActive) => (
      <VideoVisualisation
        style={{ ...style, ...visStyles.imageContainer, minHeight: "30vh" }}
        isVideoTabActive={isVideoTabActive}
        fluid
      />
    ),
    tabAttrs: (topActiveTab) => ({
      style:
        topActiveTab === "video" ? visStyles.activeTab : visStyles.inactiveTab,
    }),
    tabStyle: { minHeight: "30vh" },
  },
];

// Bottom left visualisation list
const bottomLeftVisualisations = (timeRange) => [
  {
    eventKey: "wardMap",
    title: "Ward Map",
    component: () => <HiveView timeRange={timeRange} />,
  },
  {
    eventKey: "priorBar",
    title: "Prioritisation Bar",
    component: () => (
      <TeamworkBarchart style={visStyles.imageContainer} fluid />
    ),
  },
];

// Bottom right visualisation list
const bottomRightVisualisations = (timeRange) => [
  {
    eventKey: "commNetwork",
    title: "Communication Network",
    component: () => <SocialNetworkView timeRange={timeRange} />,
  },
  {
    eventKey: "commBehaviour",
    title: "Communication Behaviour",
    component: () => <ENANetworkView />,
  },
];

export {
  topTabVisualisations,
  bottomLeftVisualisations,
  bottomRightVisualisations,
};
