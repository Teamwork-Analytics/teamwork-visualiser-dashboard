import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSNABarchartData } from "../../services/py-server/indexVisualiser";
import Barchart from "../teamwork-prio/Barchart";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
import { manualLabels } from "../observation";
ChartJS.register(...registerables);

const SNABarChart = ({
  height,
  width,
  timeRange,
  yLabelsFontSize,
  customAspectRatio,
  timelineTags,
}) => {
  const { simulationId } = useParams();
  const [snaCountData, setSnaCountData] = useState([]);
  const [isError, setIsError] = useState(snaCountData.length === 0);

  const startTime = timeRange[0];
  const endTime = timeRange[1];

  useEffect(() => {
    console.log( timelineTags.filter((d) => d.label === manualLabels.phases[2]['label']));
    const secondaryTime =
      timelineTags.length !== 0
        ? timelineTags.filter((d) => d.label === manualLabels.phases[2]['label'])[0]
            .value
        : 0;

    const doctorTime =
      timelineTags.length !== 0
        ? timelineTags.filter((d) => d.label === manualLabels.phases[3]['label'])[0].value
        : 0;

    getSNABarchartData({
      simulationId: simulationId,
      startTime: startTime,
      endTime: endTime,
      docEnterTime: doctorTime,
      secEnterTime: secondaryTime,
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          const filteredData = res.data;
          const finalData = filteredData.filter(
            (d) => d["label"][0] !== "Moving around"
          );
          setSnaCountData(finalData);
          setIsError(false);
        }
      })
      .catch((e) => {
        setIsError(true);
        console.error(e);
        // toast.error("Teamwork Barchart error");
      });
  }, [simulationId, startTime, endTime]);

  useEffect(() => {
    if (snaCountData.length === 0) {
      const secondaryTime =
        timelineTags.length !== 0
          ? timelineTags.filter((d) => d.label === manualLabels.phases[2]['label'])[0]
              .value
          : 0;

      const doctorTime =
        timelineTags.length !== 0
          ? timelineTags.filter((d) => d.label === manualLabels.phases[3]['label'])[0].value
          : 0;
      // Fetch data immediately when component mounts
      function fetchData() {
        getSNABarchartData({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
          docEnterTime: doctorTime,
          secEnterTime: secondaryTime,
        })
          .then((res) => {
            console.log(res);
            if (res.status === 200) {
              setSnaCountData(res.data);
              setIsError(false);
            }
          })
          .catch((e) => {
            setIsError(true);
            console.error(e);
            // toast.error("Teamwork Barchart error");
          });
      }

      // Set up interval to fetch data every X milliseconds. Here, we use 5000ms (5 seconds) as an example.
      const intervalId = setInterval(fetchData, 10000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [endTime, simulationId, startTime, snaCountData]);

  return (
    <SimpleErrorText isError={isError} message={"Tool in preparation."}>
      <Barchart
        data={snaCountData}
        height={height}
        width={width}
        yLabelsFontSize={yLabelsFontSize}
        customAspectRatio={customAspectRatio}
      />
    </SimpleErrorText>
  );
};

export default SNABarChart;
