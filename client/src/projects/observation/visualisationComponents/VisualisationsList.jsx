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
const topTabVisualisations = (timeRange) => [
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
        timeRange={timeRange}
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
    info: "Each hexagon represents a position of a student. The colour-filled hexagon represents the student talking in that position. ",
  },
  {
    eventKey: "priorBar",
    title: "Prioritisation Bar",
    component: () => (
      <TeamworkBarchart style={visStyles.imageContainer} fluid />
    ),
    info: "Each bar represents the percentage of time that the team spent on a specific task during that time frame.",
  },
];

// Bottom right visualisation list
const bottomRightVisualisations = (timeRange) => [
  {
    eventKey: "commNetwork",
    title: "Communication Network",
    component: () => <SocialNetworkView timeRange={timeRange} />,
    info: "The size of the circle represents the time a student spent talking. The arrow thickness represents the talking time a student spent with another student.",
  },
  {
    eventKey: "commBehaviour",
    title: "Communication Behaviour",
    component: () => <ENANetworkView timeRange={timeRange} />,
    info: "",
  },
];

export {
  topTabVisualisations,
  bottomLeftVisualisations,
  bottomRightVisualisations,
};
