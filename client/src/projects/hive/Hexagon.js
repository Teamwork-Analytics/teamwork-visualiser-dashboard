import * as d3 from "d3";
import * as d3hex from "d3-hexbin";
import { COLOURS } from "../../config/colours";
import { coordinatesForDebugging } from "./utils";

const CLASSROOM_SIZE = {
  WIDTH: 10500,
  HEIGHT: 7060,
};
const CONSTANTS = {
  HEX_RADIUS: 50,
  IMG_WIDTH: 2697,
  IMG_HEIGHT: 1715,
  HEXAGON_OPACITY: "0.5",
};

export const cssColourMatcher = {
  BLUE: COLOURS.PRIMARY_NURSE_1, // blue
  RED: COLOURS.PRIMARY_NURSE_2, //red
  GREEN: COLOURS.SECONDARY_NURSE_1, //lime
  YELLOW: COLOURS.SECONDARY_NURSE_2, // gold
  DOCTOR: "#f0f0f0",
  RELATIVE: "black",
};

const timeParser = (timestamp) => {
  return Date.parse(`1 Jan 1970 ${timestamp} GMT`);
};

class HexagonComponent {
  constructor(
    svg,
    csvData,
    posOnly,
    selectedColours,
    timeStart,
    timeEnd,
    setHrData,
    showPosAudio = true,
    showHr = true,
    showCoordinates = true
  ) {
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

        if (showPosAudio) {
          clean.forEach((record, j) => {
            // NOTE: formula = (data * image-resolution) / actual-size
            const posX =
              (record.x * CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
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
        }

        if (showCoordinates) {
          coordinatesForDebugging.forEach((record) => {
            const posX =
              (record.x * CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
            const posY =
              (record.y * CONSTANTS.IMG_HEIGHT) / CLASSROOM_SIZE.HEIGHT;

            this.render(
              [posX, posY],
              "coordinate",
              record.tagId, // Colour
              record.displayedHR // value: maximuma heart rate
            );
          });
        }

        if (showHr) {
          let hasHeartRateKey = clean.some((obj) =>
            obj.hasOwnProperty("heartrate")
          );

          if (hasHeartRateKey) {
            let hrBaselines = this.getBaselineHeartRate(d); // always get from first data.
            const hrData = this.constructHeartRateData(clean, hrBaselines); // only 4 data
            hrData.forEach((record) => {
              const posX =
                (record.x * CONSTANTS.IMG_WIDTH) / CLASSROOM_SIZE.WIDTH;
              const posY =
                (record.y * CONSTANTS.IMG_HEIGHT) / CLASSROOM_SIZE.HEIGHT;
              if (
                record.tagId in cssColourMatcher &&
                selectedColours[record.tagId] //NOTE: the key must match with the default state in HiveProvider!
              ) {
                this.render(
                  [posX, posY],
                  "fixed",
                  record.tagId, // Colour
                  record.displayedHR // value: maximuma heart rate
                );
              }
            });
            const tagIdOrder = ["BLUE", "RED", "GREEN", "YELLOW"];
            hrData.sort(
              (a, b) =>
                tagIdOrder.indexOf(a.tagId) - tagIdOrder.indexOf(b.tagId)
            );
            setHrData(hrData);
          }
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
        result[tagId] = Number(firstItem.heartrate);
      }
    }
    return result;
  }

  constructHeartRateData(data, baselines) {
    let maxHeartRates = data.reduce((d, obj) => {
      const hr = Number(obj.heartrate);
      if (!d[obj.tagId] || hr > Number(d[obj.tagId].heartrate)) {
        const baseline = baselines[obj.tagId];
        // NOTE: Changes from baseline
        d[obj.tagId] = {
          ...obj,
          heartrate: obj.heartrate - baseline,
          displayedHR: obj.heartrate.replace(".0", ""),
          baselineHr: baseline,
        };

        // just Maximum
        // d[obj.tagId] = {
        //   ...obj,
        //   baselineHr: baseline,
        // };
      }
      return d;
    }, {});
    let res = Object.entries(maxHeartRates).map(([tagId, value]) => ({
      tagId,
      ...value,
    }));
    return res;
  }

  render(subjectPos, shotFlag, colour, value) {
    const strokeWidth = "0.15em";
    const strokeColour = shotFlag === "made" ? null : cssColourMatcher[colour];
    if (shotFlag === "made" || shotFlag === "missed") {
      const hexbin = d3hex.hexbin().radius(CONSTANTS.HEX_RADIUS);
      this.svg
        .append("g")
        // .attr("transform", `translate(0, ${CONSTANTS.IMG_HEIGHT}) scale(1,-1)`) // used in the nursing data before 2024
        .selectAll(".hexagon")
        .data(hexbin([subjectPos]))
        .enter()
        .append("path")
        .attr("d", function (d) {
          // const x = -d.y + CONSTANTS.IMG_WIDTH; // used in the nursing data before 2024
          // const y = d.x; // used in the nursing data before 2024
          const x = d.x;
          const y = d.y;
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
    }
    if (shotFlag === "fixed") {
      const posX = subjectPos[0];
      const posY = subjectPos[1];

      let heartPath =
        "M0 0c-31.48-54.02-120-38.25-120 29.44 0 46.61 55.71 94.27 120 158.08 64.3-63.81 120-111.47 120-158.08 0-67.92-88.75-83.06-120-29.44z";

      const heartPosX = posX;
      const heartPosY = posY;

      this.svg
        .append("g")
        .append("path")
        .attr("d", heartPath)
        .attr("fill", cssColourMatcher[colour])
        .attr("fill-opacity", "0.8")
        .attr("stroke", "black")
        .attr("stroke-width", "1em")
        .style(
          "transform",
          `translate(${heartPosX}px, ${heartPosY}px) scale(1)`
        );

      // FOR TEXT
      this.svg
        .append("text")
        .text(value) // if value is positive, add + // .text(value >= 0 ? `+${value}` : value)
        .attr("x", posX - 2 * (posX / 100) - 35)
        .attr("y", posY + 2 * (posY / 100) + 90)
        .attr("fill", "black")
        .style("font-size", "5em");
    }

    if (shotFlag === "coordinate") {
      const hexbin = d3hex.hexbin().radius(50);
      const posX = subjectPos[0];
      const posY = subjectPos[1];

      let circlePath = "M 0, 0 a 300,300 0 1,1 600,0 a 300,300 0 1,1 -600,0";

      const heartPosX = posX;
      const heartPosY = posY;

      this.svg
        .append("g")
        .append("path")
        .attr("d", circlePath)
        .attr("fill", cssColourMatcher[colour])
        .attr("fill-opacity", "0.2")
        .attr("stroke", "grey")
        .attr("stroke-width", "0.1em")
        .style(
          "transform",
          `translate(${heartPosX}px, ${heartPosY}px) scale(1)`
        );

      // this.svg
      //   .append("g")
      //   // .attr("transform", `translate(0, ${CONSTANTS.IMG_HEIGHT}) scale(1,-1)`) // used in the nursing data before 2024
      //   .selectAll(".hexagon")
      //   .data(hexbin([subjectPos]))
      //   .enter()
      //   .append("path")
      //   .attr("d", function (d) {
      //     // const x = -d.y + CONSTANTS.IMG_WIDTH; // used in the nursing data before 2024
      //     // const y = d.x; // used in the nursing data before 2024
      //     const x = d.x;
      //     const y = d.y;
      //     return "M" + x + "," + y + hexbin.hexagon();
      //   })
      //   .attr("stroke", "black")
      //   .attr("fill", "black")
      //   .attr("fill-opacity", CONSTANTS.HEXAGON_OPACITY)
      //   .attr("stroke-width", strokeWidth);
    }
  }
}

export default HexagonComponent;

/**
 * Unused code:
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
 */
