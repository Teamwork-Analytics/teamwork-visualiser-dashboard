import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getTeamworkBarchart } from "../../services/py-server";
import Barchart from "./Barchart";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import { toast } from "react-hot-toast";

const TeamworkBarchart = () => {
  const { simulationId } = useParams();
  const { range } = useTimeline();
  const [teamworkData, setTeamworkData] = useState([]);

  const startTime = range[0];
  const endTime = range[1];

  useEffect(() => {
    getTeamworkBarchart({
      simulationId: simulationId,
      startTime: startTime,
      endTime: endTime,
    })
      .then((res) => {
        if (res.status === 200) {
          setTeamworkData(res.data);
        }
      })
      .catch((e) => {
        // toast.error("Teamwork Barchart error");
      });
  }, [simulationId, startTime, endTime]);

  return teamworkData.length !== 0 ? (
    <Barchart data={teamworkData} />
  ) : (
    <div>Nothing to see.</div>
  );
};

export default TeamworkBarchart;
