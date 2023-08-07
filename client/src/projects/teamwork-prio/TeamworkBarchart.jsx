import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTeamworkBarchart } from "../../services/py-server";
import Barchart from "./Barchart";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const TeamworkBarchart = ({ height, width, timeRange, yLabelsFontSize }) => {
  const { simulationId } = useParams();
  const [teamworkData, setTeamworkData] = useState([]);
  const [isError, setIsError] = useState(teamworkData.length === 0);

  const startTime = timeRange[0];
  const endTime = timeRange[1];

  useEffect(() => {
    getTeamworkBarchart({
      simulationId: simulationId,
      startTime: startTime,
      endTime: endTime,
    })
      .then((res) => {
        if (res.status === 200) {
          setTeamworkData(res.data);
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
    if (teamworkData.length === 0) {
      // Fetch data immediately when component mounts
      function fetchData() {
        getTeamworkBarchart({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        })
          .then((res) => {
            if (res.status === 200) {
              setTeamworkData(res.data);
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
      const intervalId = setInterval(fetchData, 5000);

      // Clean up the interval when the component is unmounted or when data is fetched
      return () => clearInterval(intervalId);
    }
  }, [endTime, simulationId, startTime, teamworkData]);

  return (
    <SimpleErrorText isError={isError} message={"Tool in preparation."}>
      <Barchart
        data={teamworkData}
        height={height}
        width={width}
        yLabelsFontSize={yLabelsFontSize}
      />
    </SimpleErrorText>
  );
};

export default TeamworkBarchart;
