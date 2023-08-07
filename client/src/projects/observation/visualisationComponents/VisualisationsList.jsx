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

import React from "react";
import TimelineVisualisation from "./TimelineVisualisation";
import VideoVisualisation from "./VideoVisualisation";

// visualisations
import { ENANetworkView, SocialNetworkView } from "../../communication";
import { HiveView } from "../../hive";
import TeamworkBarchart from "../../teamwork-prio/TeamworkBarchart";

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
const bottomVisualisations = (timeRange, showPreviewModal) => [
  {
    eventKey: "commNetwork",
    title: "Communication Network",
    component: () => <SocialNetworkView timeRange={timeRange} />,
    info: () => (
      <div>
        The size of the circle represents the time a student spent talking. The
        arrow thickness represents the talking time a student spent with another
        student.
      </div>
    ),
  },
  {
    eventKey: "commBehaviour",
    title: "Communication Behaviour",
    component: () => <ENANetworkView timeRange={timeRange} />,
    info: () => (
      <div>
        <h5>Call-out</h5>
        <ul>
          <li>Her blood pressure's really low and then her oxygen.</li>
          <li>Everything seems intact.</li>
          <li>He's got a lot of pain as well.</li>
        </ul>
        <h5>Task allocation</h5>
        <ul>
          <li>I can do Imani, I can do the obs and the antibiotic.</li>
          <li>Can you count respirate, please?</li>
        </ul>
        <h5>Questioning & Acknowledging</h5>
        <ul>
          <li>(Questioning): Do you remember how many grams we need?</li>
          <li>(Responding): It's one gram.</li>
        </ul>
        <h5>Escalation</h5>
        <ul>
          <li>Should we just call both of them so that we get more help?</li>
          <li>Just going to call a MET call on Ruth.</li>
        </ul>
        <h5>Handover</h5>
        <ul>
          <li>Number two, Bailey. The theatre has just picked…</li>
        </ul>
      </div>
    ),
  },
  {
    eventKey: "wardMap",
    title: "Ward Map",
    component: () => (
      <HiveView timeRange={timeRange} showModal={showPreviewModal} />
    ),
    info: () => (
      <div>
        Each hexagon represents a position of a student. The colour-filled
        hexagon represents the student talking in that position.
      </div>
    ),
  },
  {
    eventKey: "priorBar",
    title: "Prioritisation Bar",
    component: () => (
      <TeamworkBarchart
        style={visStyles.imageContainer}
        timeRange={timeRange}
        width="350px"
        height="250px"
        fluid
        yLabelsFontSize={7}
      />
    ),
    info: () => (
      <div>
        Each bar represents the percentage of time that the team spent on a
        specific task during that time frame.
      </div>
    ),
  },
];

export { topTabVisualisations, bottomVisualisations };
