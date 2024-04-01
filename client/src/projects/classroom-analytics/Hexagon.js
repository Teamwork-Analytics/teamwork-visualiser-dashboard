import * as d3 from "d3";
import * as d3hex from "d3-hexbin";
import { COLOURS } from "../../config/colours";
import { CLASSROOM_SIZE, HIVE_CONSTANTS } from "./constants";

export const cssColourMatcher = {
  RED: COLOURS.PERSON_1, //red
  BLUE: COLOURS.PERSON_2, // blue
  GREEN: COLOURS.PERSON_3, //lime
  YELLOW: COLOURS.PERSON_4, // gold
};

const timeParser = (timestamp) => {
  return Date.parse(`1 Jan 1970 ${timestamp} GMT`);
};

class HexagonComponent {
  constructor(svg, csvData, posOnly, selectedColours, timeStart, timeEnd) {
    this.svg = svg;

    d3.csv(csvData).then(
      function (d, i) {
        // const startTime = timeParser(timeStart);
        // const endTime = timeParser(timeEnd);
        const startTime = timeStart * 1000;
        const endTime = timeEnd * 1000;

        const clean = d.filter((data) => {
          const currTime = timeParser(data["audio time"]);
          if (startTime <= currTime && currTime <= endTime) return data;
        });

        clean.forEach((record, j) => {
          // NOTE: formula = (data * image-resolution) / actual-size
          const posX =
            (record.x * HIVE_CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
          const posY =
            (record.y * HIVE_CONSTANTS.IMG_HEIGHT) / CLASSROOM_SIZE.HEIGHT;

          // TODO: convert time to make it
          if (record["audio time"] === timeEnd) {
            return;
          }

          if (
            record.tagId in cssColourMatcher &&
            selectedColours[record.tagId] //NOTE: the key must match with the default state in HiveProvider!
          ) {
            if (record.audio === "1") {
              this.render(
                [posX, posY],
                posOnly ? "missed" : "made",
                record.tagId
              );
            } else if (record.audio === "0") {
              this.render([posX, posY], "missed", record.tagId);
            } else if (record.audio === "2") {
              this.render([posX, posY], "fixed", record.tagId, record.tracker);
            }
          }
        });
      }.bind(this)
    );
  }

  render(subjectPos, shotFlag, colour, number) {
    const hexbin = d3hex.hexbin().radius(HIVE_CONSTANTS.HEX_RADIUS);
    const h2 = d3hex.hexbin().radius(30);
    const strokeWidth = "0.15em";
    const strokeColour = shotFlag === "made" ? null : cssColourMatcher[colour];
    if (!!shotFlag) {
      this.svg
        .append("g")
        .attr(
          "transform",
          `translate(0, ${HIVE_CONSTANTS.IMG_HEIGHT}) scale(1,-1)`
        )
        .selectAll(".hexagon")
        .data(hexbin([subjectPos]))
        .enter()
        .append("path")
        .attr("d", function (d) {
          const x = -d.y + HIVE_CONSTANTS.IMG_WIDTH;
          const y = d.x;
          // const x = d.x;
          // const y = d.y;
          return "M" + x + "," + y + hexbin.hexagon();
        })
        .attr("stroke", strokeColour)
        .attr("fill", shotFlag === "made" ? cssColourMatcher[colour] : "white")
        .attr("fill-opacity", HIVE_CONSTANTS.HEXAGON_OPACITY)
        .attr("stroke-width", strokeWidth);
      // .style("opacity", 0)
      // .transition()
      // .duration(1000)
      // .delay(function (_, i) {
      //   return i * 50;
      // })
      // .style("opacity", 1);
    } else if (shotFlag === "fixed") {
      this.svg
        .append("g")
        .selectAll(".hexagon")
        .data(hexbin([subjectPos]))
        .enter()
        .append("path")
        .attr("d", function (d) {
          return "M" + d.x + "," + d.y + h2.hexagon();
        })
        .attr("stroke", "white")
        .attr("fill", "yellow")
        .attr("fill-opacity", "0.7")
        .attr("stroke-width", strokeWidth);

      // FOR TEXT
      this.svg
        .append("text")
        .text(number)
        .attr("x", subjectPos[0] + 10)
        .attr("y", subjectPos[1] + 5)
        .attr("fill", "white")
        .style("font-size", "20px");
    }
  }
}

export default HexagonComponent;
