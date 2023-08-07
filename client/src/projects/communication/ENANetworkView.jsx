import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { processing_adjacent_matrix } from "./mimic_ena_control";
import { toast } from "react-hot-toast";
import { getENAdata } from "../../services/py-server";
import { useParams } from "react-router-dom";
import SimpleErrorText from "../../components/errors/ErrorMessage";

const ENANetworkView = ({ timeRange, height = "30vh" }) => {
  const { simulationId } = useParams();
  const [enaData, setENAdata] = useState([]);
  const [networkENAData, setNetworkENAData] = useState([]);
  const [isError, setIsError] = useState(networkENAData.length === 0);

  const startTime = timeRange[0];
  const endTime = timeRange[1];

  useEffect(() => {
    async function callData() {
      try {
        const res = await getENAdata({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        });
        if (res.status === 200) {
          // const cleanedPhases = cleanRawPhases(phases);
          setENAdata(res.data);
          setIsError(false);
        }
      } catch (error) {
        console.log(error);
        setIsError(true);
      }
    }
    callData();
  }, [simulationId, startTime, endTime]);

  useEffect(() => {
    try {
      const net_data = processing_adjacent_matrix(enaData);
      if (enaData.length !== 0) {
        setNetworkENAData(net_data["nodes"].concat(net_data["edges"]));
      }
    } catch (err) {
      // toast.error(`ENA error: unable to change visualisation based on time`);
      console.error(err);
    }
  }, [enaData]);

  useEffect(() => {
    if (isError) {
      // Fetch data immediately when component mounts
      async function callData() {
        try {
          const res = await getENAdata({
            simulationId: simulationId,
            startTime: startTime,
            endTime: endTime,
          });
          if (res.status === 200) {
            // const cleanedPhases = cleanRawPhases(phases);
            setENAdata(res.data);
            setIsError(false);
          }
        } catch (error) {
          console.log(error);
          setIsError(true);
        }
      }
      callData();

      // Set up interval to fetch data every X milliseconds. Here, we use 5000ms (5 seconds) as an example.
      const intervalId = setInterval(callData, 10000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [endTime, isError, simulationId, startTime]);

  const net_options = {
    name: "circle",
    fit: true, // whether to fit the viewport to the graph
    padding: 5, // the padding on fit
    boundingBox: { x1: 0, y1: 0, x2: 600, y2: 300 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
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
    <SimpleErrorText isError={isError} message={"Tool in preparation."}>
      <div
        style={{
          minWidth: "300px",
          width: "100%",
          height: height,
          position: "relative",
        }}
      >
        <CytoscapeComponent
          cy={(cy) => {
            cy.remove("nodes['*']");
            cy.add(networkENAData);
            cy.style(stylesheet);
            cy.fit();
            const layout = cy.layout(net_options);
            layout.run();
            cy.userPanningEnabled(false); // Disable user panning
          }}
          layout={net_options}
          fit={true}
          stylesheet={stylesheet}
          elements={networkENAData}
          style={{
            textAlign: "left",
            width: "100%",
            height: height,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
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
    </SimpleErrorText>
  );
};

export default ENANetworkView;
