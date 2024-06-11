import * as d3 from "d3";
import * as d3hex from "d3-hexbin";
import { COLOURS } from "../../config/colours";

const CLASSROOM_SIZE = {
  WIDTH: 9500,
  HEIGHT: 6960,
};
const CONSTANTS = {
  HEX_RADIUS: 50,
  IMG_WIDTH: 2297,
  IMG_HEIGHT: 1715,
  HEXAGON_OPACITY: "0.5",
};

export const cssColourMatcher = {
  GREEN: COLOURS.SECONDARY_NURSE_1, //lime
  RED: COLOURS.PRIMARY_NURSE_1, //red
  BLUE: COLOURS.PRIMARY_NURSE_2, // blue
  YELLOW: COLOURS.SECONDARY_NURSE_2, // gold
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
          const posX = (record.x * CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
          const posY =
            (record.y * CONSTANTS.IMG_HEIGHT) / CLASSROOM_SIZE.HEIGHT;

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
            }
          }
        });

        let hasHeartRateKey = clean.some((obj) =>
          obj.hasOwnProperty("heartRate")
        );

        if (hasHeartRateKey) {
          let hrBaselines = this.getBaselineHeartRate(d); // always get from first data.
          const hrData = this.constructHeartRateData(clean, hrBaselines); // only 4 data
          console.log(hrData);

          hrData.forEach((record) => {
            const posX =
              (record.x * CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
            const posY =
              (record.y * CONSTANTS.IMG_HEIGHT) / CLASSROOM_SIZE.HEIGHT;

            this.render(
              [posX, posY],
              "fixed",
              record.tagId, // Colour
              record.heartRate // value: maximuma heart rate
            );
          });
        }
      }.bind(this)
    );

    // this.svg.append("text")
    //     .text("PC")
    //     .attr("x", 370)
    //     .attr("y", 120)
    //     .attr("fill", "white");
  }

  getBaselineHeartRate(data) {
    let tagIds = ["RED", "GREEN", "BLUE", "YELLOW"];
    let result = {};

    for (let tagId of tagIds) {
      let firstItem = data.find((item) => item.tagId === tagId);
      if (firstItem) {
        result[tagId] = Number(firstItem.heartRate);
      }
    }
    return result;
  }

  constructHeartRateData(data, baselines) {
    let maxHeartRates = data.reduce((acc, obj) => {
      const hr = Number(obj.heartRate);
      if (!acc[obj.tagId] || hr > Number(acc[obj.tagId].heartRate)) {
        const baseline = baselines[obj.tagId];
        // NOTE: Changes from baseline
        // acc[obj.tagId] = {
        //   ...obj,
        //   heartRate: obj.heartRate - baseline,
        //   baselineHr: baseline,
        // };

        // just Maximum
        acc[obj.tagId] = {
          ...obj,
          baselineHr: baseline,
        };
      }
      return acc;
    }, {});
    let res = Object.entries(maxHeartRates).map(([tagId, value]) => ({
      tagId,
      ...value,
    }));
    return res;
  }

  render(subjectPos, shotFlag, colour, value) {
    const hexbin = d3hex.hexbin().radius(CONSTANTS.HEX_RADIUS);
    const h2 = d3hex.hexbin().radius(100);
    const strokeWidth = "0.15em";
    const strokeColour = shotFlag === "made" ? null : cssColourMatcher[colour];
    if (shotFlag === "made" || shotFlag === "missed") {
      this.svg
        .append("g")
        .attr("transform", `translate(0, ${CONSTANTS.IMG_HEIGHT}) scale(1,-1)`)
        .selectAll(".hexagon")
        .data(hexbin([subjectPos]))
        .enter()
        .append("path")
        .attr("d", function (d) {
          const x = -d.y + CONSTANTS.IMG_WIDTH;
          const y = d.x;
          // const x = d.x;
          // const y = d.y;
          return "M" + x + "," + y + hexbin.hexagon();
        })
        .attr("stroke", strokeColour)
        .attr("fill", shotFlag === "made" ? cssColourMatcher[colour] : "white")
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
      // this.svg
      //   .append("g")
      //   .attr("transform", `translate(0, ${CONSTANTS.IMG_HEIGHT}) scale(1,-1)`)
      //   .selectAll(".hexagon")
      //   .data(hexbin([subjectPos]))
      //   .enter()
      //   .append("path")
      //   .attr("d", function (d) {
      //     const x = -d.y + CONSTANTS.IMG_WIDTH;
      //     const y = d.x;
      //     // const x = d.x;
      //     // const y = d.y;
      //     return "M" + x + "," + y + h2.hexagon();
      //   })
      //   .attr("stroke", "black")
      //   .attr("fill", cssColourMatcher[colour])
      //   .attr("fill-opacity", "0.7")
      //   .attr("stroke-width", "1em");
      const posX = CONSTANTS.IMG_WIDTH - subjectPos[1];
      const posY = CONSTANTS.IMG_HEIGHT - subjectPos[0];
      let heartPath =
        "M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z";

      const heartPosX = posX - 110;
      const heartPosY = posY - 120;

      this.svg
        .append("g")
        .append("path")
        .attr("d", heartPath)
        .attr("fill", cssColourMatcher[colour])
        .attr("fill-opacity", "0.8")
        .attr("stroke", "black")
        .attr("stroke-width", "0.1em")
        .style(
          "transform",
          `translate(${heartPosX}px, ${heartPosY}px) scale(10)`
        );

      // FOR TEXT
      this.svg
        .append("text")
        .text(value)
        .attr("x", posX - 2 * (posX / 100))
        .attr("y", posY + 2 * (posY / 100))
        .attr("fill", "black")
        .style("font-size", "5em");
    }
  }
}

export default HexagonComponent;
