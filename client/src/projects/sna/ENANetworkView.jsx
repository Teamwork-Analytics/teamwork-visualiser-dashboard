import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useParams } from "react-router-dom";
import { processing_adjacent_matrix } from "./mimic_ena_control";
import { toast } from "react-hot-toast";
import { getENAdata } from "../../services/communication";

const ENANetworkView = () => {
  useEffect(() => {});

  const [data, setData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const { simulationId } = useParams();

  /* getData from backend */
  useEffect(() => {
    getENAdata(simulationId).then((res) => {
      if (res.status === 200) {
        // const cleanedPhases = cleanRawPhases(phases);
        setData(res.data);
      }
    });
  }, [simulationId]);

  useEffect(() => {
    try {
      const net_data = processing_adjacent_matrix(data);
      if (data.length !== 0) {
        setNetworkData(net_data["nodes"].concat(net_data["edges"]));
      }
    } catch (err) {
      toast.error(`SNA error: unable to change visualisation based on time`);
      console.error(err);
    }
  }, [data]);

  const net_options = {
    name: "circle",
    fit: true, // whether to fit the viewport to the graph
    padding: 5, // the padding on fit
    boundingBox: { x1: 50, y1: 50, x2: 1000, y2: 800 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
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
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
        size: "3em",
      },
    },
    {
      selector: "edge",
      style: {
        // 'width': 3,
        "line-color": "rgb(33, 159, 217)",
        // 'line-color': 'red',
        "target-arrow-color": "black",
        "target-arrow-shape": "none",
        "curve-style": "bezier",
        "arrow-scale": 1.5,
      },
    },
  ];

  return (
    <CytoscapeComponent
      layout={net_options}
      fit={true}
      stylesheet={stylesheet}
      elements={networkData}
      style={{ textAlign: "left", width: "100%", height: "30vh" }}
    />
  );
};

export default ENANetworkView;
