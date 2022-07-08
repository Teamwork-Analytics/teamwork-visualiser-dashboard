import * as d3 from "d3";
import * as d3hex from "d3-hexbin";
import dataAll from "./data/clean/145_all.csv";

const CONSTANTS = {
  HEX_RADIUS: 25,
  HEIGHT: 3183,
  HEXAGON_OPACITY: "0.2",
};

const cssColourMatcher = {
  GREEN: "lime",
  RED: "red",
  BLUE: "blue",
  YELLOW: "gold",
};

class HexagonComponent {
  constructor(svg, session, posOnly) {
    this.svg = svg;

    // const phase = ["0:04:57", "0:07:34", "0:17:35", "0:23:55", "0:33:10"];

    d3.csv(dataAll).then(
      function (d, i, arr) {
        d.forEach((record, j) => {
          // formula = (data * image-resolution) / actual-size
          const posX = (record.x * 2902) / 7742;
          const posY = (record.y * 3283) / 10395;

          // if (record["audio time"] === phase[4]) {
          //   console.log(record["audio time"]);
          //   arr.length = i + 1;
          // }

          if (record.tagId in cssColourMatcher) {
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

    // this.svg.append("text")
    //     .text("PC")
    //     .attr("x", 370)
    //     .attr("y", 120)
    //     .attr("fill", "white");
  }

  render(subjectPos, shotFlag, colour, number) {
    const hexbin = d3hex.hexbin().radius(CONSTANTS.HEX_RADIUS);
    const h2 = d3hex.hexbin().radius(30);
    const strokeWidth = !!colour ? "0.02em" : "0.02em";
    // const strokeColour = colour ? cssColourMatcher[colour] : "black";
    const strokeColour = "black";
    if (!!shotFlag) {
      this.svg
        .append("g")
        .attr("transform", `translate(0, ${CONSTANTS.HEIGHT}) scale(1,-1)`)
        .selectAll(".hexagon")
        .data(hexbin([subjectPos]))
        .enter()
        .append("path")
        .attr("d", function (d) {
          return "M" + d.x + "," + d.y + hexbin.hexagon();
        })
        .attr("stroke", strokeColour)
        .attr("fill", shotFlag === "made" ? cssColourMatcher[colour] : "grey")
        .attr("fill-opacity", CONSTANTS.HEXAGON_OPACITY)
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
