import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getTeamworkBarchart } from "../../services/py-server";
import Barchart from "./Barchart";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import { toast } from "react-hot-toast";
import SimpleErrorText from "../../components/errors/ErrorMessage";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const TeamworkBarchart = () => {
  const { simulationId } = useParams();
  const { range } = useTimeline();
  const [teamworkData, setTeamworkData] = useState([]);
  const [isError, setIsError] = useState(teamworkData.length === 0);

  // const startTime = range[0];
  // const endTime = range[1];

  // useEffect(() => {
  //   getTeamworkBarchart({
  //     simulationId: simulationId,
  //     startTime: startTime,
  //     endTime: endTime,
  //   })
  //     .then((res) => {
  //       if (res.status === 200) {
  //         setTeamworkData(res.data);
  //         setIsError(false);
  //       }
  //     })
  //     .catch((e) => {
  //       setIsError(true);
  //       // toast.error("Teamwork Barchart error");
  //     });
  // }, [simulationId, startTime, endTime]);

  return (
    <SimpleErrorText
      isError={isError}
      message={"Unable to display Teamwork Barchart."}
    >
      <Barchart data={teamworkData} />
    </SimpleErrorText>
  );
};

export default TeamworkBarchart;
