import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getENABarchartData } from "../../services/py-server/indexVisualiser";
import Barchart from "./BarchartForENA";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const ENABarChart = ({
  height,
  width,
  timeRange,
  yLabelsFontSize,
  customAspectRatio,
}) => {
  const { simulationId } = useParams();
  const [enaCountData, setEnaCountData] = useState([]);
  const [isError, setIsError] = useState(enaCountData.length === 0);

  const startTime = timeRange[0];
  const endTime = timeRange[1];

  useEffect(() => {

    getENABarchartData({
      simulationId: simulationId,
      startTime: startTime,
      endTime: endTime,
    })
      .then((res) => {
        if (res.status === 200) {
          const filteredData = res.data;
          const finalData = filteredData.filter(
            (d) => d["label"][0] !== "Moving around"
          );
          setEnaCountData(finalData);
          setIsError(false);
        }
      })
      .catch((e) => {
        setIsError(true);
        console.error(e);
        console.log('Error in ENA Barchart');
      });
  }, [simulationId, startTime, endTime]);

  useEffect(() => {
    if (enaCountData.length === 0) {
      // Fetch data immediately when component mounts
      function fetchData() {
        getENABarchartData({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        })
          .then((res) => {
            if (res.status === 200) {
              setEnaCountData(res.data);
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
  }, [endTime, simulationId, startTime, enaCountData]);

  return (
    <SimpleErrorText isError={isError} message={"Tool in preparation."}>
      <Barchart
        data={enaCountData}
        height={height}
        width={width}
        yLabelsFontSize={yLabelsFontSize}
        customAspectRatio={customAspectRatio}
      />
    </SimpleErrorText>
  );
};

export default ENABarChart;
