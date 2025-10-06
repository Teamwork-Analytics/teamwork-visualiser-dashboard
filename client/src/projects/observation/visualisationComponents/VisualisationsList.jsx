/**
 * @file VisualisationList
 *
 * @description This module exports configurations lists for visualisation components, including their styles and info.
 * Each configuration is an object that includes the following properties:
 * - eventKey: A unique key to identify the visualisation.
 * - title: The display title of the visualisation.
 * - component: A function that returns the visualisation component.
 * - info: A function that returns a React component providing additional information about the visualisation.
 * The exported lists include topTabVisualisations, bottomLeftVisualisations, bottomRightVisualisations, and bottomVisualisations.
 */

import TimelineVisualisation from "./TimelineVisualisation";
import VideoVisualisation from "./VideoVisualisation";

// visualisations
import { ENANetworkView, SocialNetworkView } from "../../communication";
import { HiveView } from "../../hive";
import SNABarChart from "../../communication/SNABarChart";
import ENABarChart from "../../communication/ENABarChart";
import TeamworkBarchart from "../../teamwork-prio/TeamworkBarchart";
import HeartRateBarchart from "../../heartRate/HeartRateBarchart"

// Styles for different visualisation components
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

// Configuration for top tab visualisations
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

// Configuration for bottom visualisations -> for carousel
const bottomVisualisations = (timeRange, timelineTags, showPreviewModal) => [
  // {
  //   eventKey: "wardMap",
  //   title: "Ward Map",
  //   component: () => (
  //     <HiveView
  //       timeRange={timeRange}
  //       showModal={showPreviewModal}
  //       width="100%"
  //       height="30vh"
  //     />
  //   ),
  //   info: () => (
  //     <div>
  //       Each hexagon represents a position of a student. The colour-filled
  //       hexagon represents the student talking in that position.
  //     </div>
  //   ),
  // },

  {
    eventKey: "heartRateBarchart",
    title: "Heart Rate Bar Chart",
    component: () => (
      <HeartRateBarchart
        timeRange={timeRange}
        showModal={showPreviewModal}
        width="100%"
        height="30vh"
      />
    ),
    info: () => (
      <div>
        The height of each bar represents the amount of communication instances
        in that category.
      </div>
    ),
  },
  {
    eventKey: "snaBarchart",
    title: "SNA Bar Chart",
    component: () => (
      <SNABarChart
        timeRange={timeRange}
        timelineTags={timelineTags}
        showModal={showPreviewModal}
        width="100%"
        height="30vh"
      />
    ),
    info: () => (
      <div>
        The height of each bar represents the amount of communication instances
        in that category.
      </div>
    ),
  },
  {
    eventKey: "enaBarchart",
    title: "ENA Bar Chart",
    component: () => (
      <ENABarChart
        timeRange={timeRange}
        timelineTags={timelineTags}
        showModal={showPreviewModal}
        width="100%"
        height="30vh"
      />
    ),
    info: () => (
      <div>
        The height of each bar represents the amount of communication behaviour
        instances in that category.
      </div>
    ),
  },
  // {
  //   eventKey: "commNetwork",
  //   title: "Communication Network",
  //   component: () => (
  //     <SocialNetworkView
  //       timeRange={timeRange}
  //       timelineTags={timelineTags}
  //       width="100%"
  //       height="30vh"
  //     />
  //   ),
  //   info: () => (
  //     <div>
  //       The size of the circle represents the time a student spent talking. The
  //       arrow thickness represents the talking time a student spent with another
  //       student.
  //     </div>
  //   ),
  // },
  // {
  //   eventKey: "commBehaviour",
  //   title: "Communication Behaviour",
  //   component: () => (
  //     <ENANetworkView timeRange={timeRange} width="100%" height="30vh" />
  //   ),
  //   info: () => (
  //     <div>
  //       <h5>Call-out</h5>
  //       <ul>
  //         <li>Her blood pressure's really low and then her oxygen.</li>
  //         <li>Everything seems intact.</li>
  //         <li>He's got a lot of pain as well.</li>
  //       </ul>
  //       <h5>Task allocation</h5>
  //       <ul>
  //         <li>I can do Imani, I can do the obs and the antibiotic.</li>
  //         <li>Can you count respirate, please?</li>
  //       </ul>
  //       <h5>Questioning & Acknowledging</h5>
  //       <ul>
  //         <li>(Questioning): Do you remember how many grams we need?</li>
  //         <li>(Responding): It's one gram.</li>
  //       </ul>
  //       <h5>Escalation</h5>
  //       <ul>
  //         <li>Should we just call both of them so that we get more help?</li>
  //         <li>Just going to call a MET call on Ruth.</li>
  //       </ul>
  //       <h5>Handover</h5>
  //       <ul>
  //         <li>Number two, Bailey. The theatre has just picked…</li>
  //       </ul>
  //     </div>
  // ),
  // },
  {
    eventKey: "hearRateVis",
    title: "Heart Rate Visualisation",
    component: () => (
      <TeamworkBarchart
        timeRange={timeRange}
        showModal={showPreviewModal}
        width={"100%"}
        height={"30vh"}
      />
    ),
    info: () => (
      <div>
        Heart rate Barchart.
      </div>
    ),
  }
];

export { topTabVisualisations, bottomVisualisations };
