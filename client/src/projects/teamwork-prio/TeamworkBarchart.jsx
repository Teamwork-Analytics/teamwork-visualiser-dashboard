import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTeamworkBarchart } from "../../services/py-server";
import Barchart from "./Barchart";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const TeamworkBarchart = ({ height, width, timeRange }) => {
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
        // toast.error("Teamwork Barchart error");
      });
  }, [simulationId, startTime, endTime]);

  return (
    <SimpleErrorText isError={isError} message={"No data."}>
      <Barchart data={teamworkData} height={height} width={width} />
    </SimpleErrorText>
  );
};

export default TeamworkBarchart;
