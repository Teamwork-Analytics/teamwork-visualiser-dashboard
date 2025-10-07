import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HeartRates } from "../../services/py-server/heartrate";
// import BarchartForHeartRate from "./barchartForHeartRate";
import BarchartForHeartRate from "./BarchartForHeartRate";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
import { cssColourMatcher } from "../../config/colours";

ChartJS.register(...registerables);


const getHeartBeatVisualisationData = (data) => {

  const keys = Object.keys(data);
  const averageHeartBeat = {}

  keys.forEach(element => {
    const heartBeatValues = data[element]['Values'].map((row) => row.Value);
    averageHeartBeat[element] = {
      'max': heartBeatValues.reduce((x,y) => x > y ? x : y),
      'average': heartBeatValues.reduce((x,y) => x + y) / heartBeatValues.length,
      'baseline': data[element]['Baseline'],
    }
  });

  return averageHeartBeat;
};

const HeartRateBarChart = ({
  height,
  width,
  timeRange,
  yLabelsFontSize,
  customAspectRatio,
  timelineTags,
}) => {
  const { simulationId } = useParams();
  const [heartRateData, setHeartRateData] = useState({});
  const [isError, setIsError] = useState(heartRateData.length === 0);

  const startTime = timeRange[0];
  const endTime = timeRange[1];

  useEffect(() => {
    HeartRates.get_by_id_and_time({
      simulationId: simulationId,
      startTime: startTime,
      endTime: endTime,
    })
      .then((res) => {
        if (res.status === 200) {
          const filteredData = res.data;
          setHeartRateData(getHeartBeatVisualisationData(filteredData));
          setIsError(false);
        }
      })
      .catch((e) => {
        setIsError(true);
        console.error(e);
      });
  }, [simulationId, startTime, endTime]);

  useEffect(() => {
    if (heartRateData.length === 0) {
      // Fetch data immediately when component mounts
      function fetchData() {
        HeartRates.get_by_id_and_time({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        })
          .then((res) => {
            if (res.status === 200) {
              setHeartRateData(getHeartBeatVisualisationData(res.data));
              setIsError(false);
            }
          })
          .catch((e) => {
            console.error('Erroreee', e);
            setIsError(true);
          });
      }

      // Set up interval to fetch data every X milliseconds. Here, we use 5000ms (5 seconds) as an example.
      const intervalId = setInterval(fetchData, 10000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [endTime, simulationId, startTime, heartRateData]);

  return (
    <SimpleErrorText isError={isError} message={"Tool in preparation."}>
      <BarchartForHeartRate
        data={heartRateData}
        height={height}
        width={width}
        yLabelsFontSize={yLabelsFontSize}
        customAspectRatio={customAspectRatio}
        cssColourMatcher={cssColourMatcher}
      />
    </SimpleErrorText>
  );
};

export default HeartRateBarChart;
