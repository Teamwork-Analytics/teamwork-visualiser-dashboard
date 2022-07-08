import React, { useEffect, useMemo } from "react";
// import * as d3 from "d3";
import * as d3 from "d3";
import HexagonComponent from "./Hexagon";

//TODO: make the following floor plan much more dynamic
import floorPlan from "./floor-plan/nursing-small.svg";

const HiveView = ({ session = 145 }) => {
  useEffect(() => {
    d3.select("#floor-plan").remove();
    let svgContainer = d3.select("#hive");
    d3.xml(floorPlan).then((data) => {
      if (!svgContainer.node().hasChildNodes()) {
        svgContainer.node().append(data.documentElement);
        new HexagonComponent(
          svgContainer.select("#floor-plan"),
          session,
          false
        );
      }
    });
    // return () => {
    //   svgContainer.node().remove();
    // };
  }, []);

  return (
    <div id="hive" style={{ margin: "0 auto", textAlign: "center" }}></div>
  );
};

export default HiveView;
