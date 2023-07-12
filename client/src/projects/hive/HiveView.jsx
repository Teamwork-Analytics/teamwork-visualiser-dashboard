import { Fragment, useEffect, useRef } from "react";
import * as d3 from "d3";

import floorPlan from "./floor-plan/floor-plan.svg";
import HexagonComponent from "./Hexagon";
import { useHive } from "./HiveContext";
import { HivePrimaryControlView } from "./HiveControlView";
import EmptyPlaceholder from "../../components/EmptyPlaceholder";
import { useParams } from "react-router-dom";

const HiveView = ({ timeRange }) => {
  const hiveRef = useRef();
  const { hiveState, markers } = useHive();
  const { simulationId } = useParams();
  const csvUrl = process.env.PUBLIC_URL + "/api/hives/" + simulationId;

  useEffect(() => {
    d3.select("#floor-plan").remove();
    const svgContainer = d3.select(hiveRef.current);
    d3.xml(floorPlan).then((data) => {
      if (
        svgContainer.node() !== null &&
        !svgContainer.node().hasChildNodes()
      ) {
        svgContainer.node().append(data.documentElement);
        new HexagonComponent(
          svgContainer.select("#floor-plan"),
          csvUrl,
          false,
          hiveState.participants,
          timeRange[0],
          timeRange[1]
          // markers[hiveState.phase[0]].timestamp, //start
          // markers[hiveState.phase[1]].timestamp //end
        );
      }
    });
  }, [csvUrl, hiveState, markers, timeRange]);

  return (
    <Fragment>
      {markers.length === 0 ? (
        <EmptyPlaceholder />
      ) : (
        <div
          style={{
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "550px",
              height: "25vh",
              maxHeight: "1080px",
              // backgroundColor: "#303030",
              borderRadius: "1em",
            }}
          >
            <div ref={hiveRef} style={{ height: "99%" }} />
            <HivePrimaryControlView />
          </div>
          {/* <HiveSlider /> removed slider, replaced with main controller*/}
        </div>
      )}
    </Fragment>
  );
};

export default HiveView;
