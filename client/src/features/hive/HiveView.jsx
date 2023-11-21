import { Fragment, useEffect, useRef } from "react";
import * as d3 from "d3";

import floorPlan from "./floor-plan/floor-plan.svg";
import HexagonComponent from "./Hexagon";
import { useHive } from "./HiveContext";
import { HivePrimaryControlView } from "./HiveControlView";
import { useParams } from "react-router-dom";
import SimpleErrorText from "src/shared/components/errors/ErrorMessage";

const HiveView = ({
  timeRange,
  showFilter = true,
  height = "32vh",
  width = "30vw",
  showModal, // pass in showPreviewModal as a prop to trigger rerender
  hiveState: hiveStateProp, // renamed prop to distinguish it from hook state
}) => {
  const hiveRef = useRef();
  const { hiveState: hiveStateHook, isHiveReady } = useHive(); // renamed state to distinguish it from prop
  const hiveState = hiveStateProp || hiveStateHook; // Use prop if available, otherwise use state from hook
  const { simulationId } = useParams();
  const csvUrl = process.env.PUBLIC_URL + "/api/hives/" + simulationId;

  useEffect(() => {
    try {
      d3.select("#floor-plan").remove();
      const svgContainer = d3.select(hiveRef.current);
      d3.xml(floorPlan).then((data) => {
        if (
          isHiveReady &&
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
          );
        }
      });
    } catch (err) {}
  }, [csvUrl, hiveState, isHiveReady, timeRange, showModal]);

  return (
    <Fragment>
      {!isHiveReady ? (
        <SimpleErrorText isError={true} message={"Tool in preparation."} />
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
              width: width,
              height: height,
              maxHeight: "1080px",
              borderRadius: "1em",
            }}
          >
            <div ref={hiveRef} style={{ height: "99%" }} />
          </div>
          {showFilter && <HivePrimaryControlView />}
        </div>
      )}
    </Fragment>
  );
};

export default HiveView;
