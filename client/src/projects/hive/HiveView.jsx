import React, { useEffect } from "react";
// import * as d3 from "d3";
import * as d3 from "d3";
import HexagonComponent from "./Hexagon";
import dataAll from "./data/clean/145_all.csv";

//TODO: make the following floor plan much more dynamic
import floorPlan from "./floor-plan/nursing-small.svg";
import { useHive } from "./HiveContext";
import HiveSlider from "./HiveSlider";

const HiveView = () => {
  const { state, phases } = useHive();

  useEffect(() => {
    d3.select("#floor-plan").remove();
    let svgContainer = d3.select("#hive");
    d3.xml(floorPlan).then((data) => {
      if (!svgContainer.node().hasChildNodes()) {
        svgContainer.node().append(data.documentElement);
        new HexagonComponent(
          svgContainer.select("#floor-plan"),
          dataAll, //TODO: the data should be coming from the API (back-end)
          false,
          state.participants,
          phases[state.phase].time
        );
      }
    });
    // return () => {
    //   svgContainer.node().remove();
    // };
  }, [state, phases]);

  return (
    <div style={{ margin: "0 auto", textAlign: "center", display: "flex" }}>
      <div style={{ width: "700px", height: "80vh", marginBottom: "15px" }}>
        <div id="hive"></div>
      </div>
      <HiveSlider data={phases} />
    </div>
  );
};

export default HiveView;
