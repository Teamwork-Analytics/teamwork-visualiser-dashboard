import React, { Fragment, useEffect } from "react";
import * as d3 from "d3";
import HexagonComponent from "./Hexagon";

//TODO: make the following floor plan much more dynamic
import floorPlan from "./floor-plan/nursing-small.svg";
import { useHive } from "./HiveContext";
import HiveSlider from "./HiveSlider";
import { HivePrimaryControlView } from "./HiveControlView";
import { useParams } from "react-router-dom";
import EmptyPlaceholder from "../../components/EmptyPlaceholder";
import HiveAPI from "../../services/api/hive";

const HiveView = () => {
  const { state, markers, setMarkers } = useHive();
  const { simulationId } = useParams();

  useEffect(() => {
    const csvUrl = process.env.PUBLIC_URL + "/api/hives/" + simulationId;
    d3.select("#floor-plan").remove();
    let svgContainer = d3.select("#hive");
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
          state.participants,
          markers[state.phase[0]].timestamp,
          markers[state.phase[1]].timestamp
        );
      }
    });
  }, [state, markers]);

  useEffect(() => {
    HiveAPI.phases(simulationId).then((res) => {
      if (res.status === 200) {
        // const cleanedPhases = cleanRawPhases(phases);
        setMarkers(res.data);
      }
    });
  }, []);

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
          <div style={{ width: "550px", height: "80vh", maxHeight: "1080px" }}>
            <div id="hive" style={{ height: "90%", marginBottom: "1em" }} />
            <HivePrimaryControlView />
          </div>
          <HiveSlider />
        </div>
      )}
    </Fragment>
  );
};

export default HiveView;
