import TimelineVisualisation from "./TimelineVisualisation";
import VideoVisualisation from "./VideoVisualisation";
import { Image } from "react-bootstrap";

// placeholder images
import priorBar from "../../../images/vis/prioritisation-bar.png";
import wardMap from "../../../images/vis/ward-map.png";
import comBehaviour from "../../../images/vis/com-behaviour.png";
import comNetwork from "../../../images/vis/communication-network.png";

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
const bottomLeftVisualisations = [
  {
    eventKey: "priorBar",
    title: "Prioritisation Bar",
    component: () => (
      <Image src={priorBar} style={visStyles.imageContainer} fluid />
    ),
  },
];

// Bottom right visualisation list
const bottomRightVisualisations = [
  {
    eventKey: "commNetwork",
    title: "Communication Network",
    component: () => (
      <Image src={comNetwork} style={visStyles.imageContainer} fluid />
    ),
  },
  {
    eventKey: "commBehaviour",
    title: "Communication Behaviour",
    component: () => (
      <Image src={comBehaviour} style={visStyles.imageContainer} fluid />
    ),
  },
  {
    eventKey: "wardMap",
    title: "Ward Map",
    component: () => (
      <Image src={wardMap} style={visStyles.imageContainer} fluid />
    ),
  },
];

export {
  topTabVisualisations,
  bottomLeftVisualisations,
  bottomRightVisualisations,
};
