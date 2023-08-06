import { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { processing_csv } from "./cyto_control";
import { useDebriefing } from "../debriefing-projection/DebriefContext";

const CytoComponent = ({ netData, height = "30vh" }) => {
  const net_options = {
    name: "circle",
    fit: true, // whether to fit the viewport to the graph
    padding: 10, // the padding on fit
    boundingBox: { x1: 50, y1: 50, x2: 600, y2: 300 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
    nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
    spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    radius: undefined, // the radius of the circle
    startAngle: (3 / 2) * Math.PI, // where nodes start in radians
    sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
    clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    animateFilter: function (node, i) {
      return true;
    }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position) {
      return position;
    }, // transform a given node position. Useful for changing flow direction in discrete layouts
  };

  const stylesheet = [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
      },
    },

    {
      selector: "edge",
      style: {
        // 'width': 3,
        "line-color": "black",
        "target-arrow-color": "black",
        "target-arrow-shape": "triangle-backcurve",
        "curve-style": "bezier",
        "arrow-scale": 1.3,
      },
    },
  ];

  return (
    <CytoscapeComponent
      cy={(cy) => {
        cy.remove("nodes['*']");
        cy.add(netData);
        cy.style(stylesheet);
        cy.fit();
        const layout = cy.layout(net_options);
        layout.run();
        cy.userPanningEnabled(false); // Disable user panning
      }}
      style={{
        textAlign: "left",
        width: "100%",
        height: height,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

const SocialNetworkView = ({ timeRange, height = "30vh" }) => {
  const { snaData } = useDebriefing();
  const startTime = timeRange[0];
  const endTime = timeRange[1];
  const [netData, setNetData] = useState([]);

  /* getData from backend */
  useEffect(() => {
    if (snaData.length !== 0) {
      const net_data = processing_csv(snaData, startTime, endTime, 3, 100);
      if (net_data !== undefined) {
        setNetData(net_data["nodes"].concat(net_data["edges"]));
      }
    }
  }, [snaData, startTime, endTime]);

  return (
    <div
      style={{
        minWidth: "300px",
        width: "100%",
        height: height,
        position: "relative",
      }}
    >
      {netData !== undefined && (
        <CytoComponent netData={netData} height={height} />
      )}
      {/* Below is work-around to disable user interacting with the div (two fingers touching canvas will cause errors) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default SocialNetworkView;
