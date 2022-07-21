import React, { useEffect } from "react";
// import * as d3 from "d3";
import * as d3 from "d3";
import HexagonComponent from "./Hexagon";
import data189 from "./data/189_all.csv";
import data181 from "./data/181_all.csv";

//TODO: make the following floor plan much more dynamic
import floorPlan from "./floor-plan/nursing-small.svg";
import { useHive } from "./HiveContext";
import HiveSlider from "./HiveSlider";
import { HivePrimaryControlView } from "./HiveControlView";
import { useParams } from "react-router-dom";

const HiveView = () => {
  const { state, markers } = useHive();
  const { sessionId } = useParams();

  useEffect(() => {
    d3.select("#floor-plan").remove();
    let svgContainer = d3.select("#hive");
    d3.xml(floorPlan).then((data) => {
      if (!svgContainer.node().hasChildNodes()) {
        svgContainer.node().append(data.documentElement);
        new HexagonComponent(
          svgContainer.select("#floor-plan"),
          sessionId === "181" ? data181 : data189, //TODO: the data should be coming from the API (back-end)
          false,
          state.participants,
          markers[state.phase[0]].time,
          markers[state.phase[1]].time
        );
      }
    });
    // return () => {
    //   svgContainer.node().remove();
    // };
  }, [state, markers]);

  return (
    <div style={{ margin: "0 auto", textAlign: "center", display: "flex" }}>
      <div style={{ width: "550px", height: "90vh", maxHeight: "1080px" }}>
        <div id="hive" style={{ height: "80vh", marginBottom: "50px" }} />
        <HivePrimaryControlView />
      </div>
      <HiveSlider />
    </div>
  );
};

export default HiveView;
