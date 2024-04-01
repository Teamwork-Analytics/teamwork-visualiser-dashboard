import { useState } from "react";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import TimelineVisualisation from "../observation/visualisationComponents/TimelineVisualisation";
import { HiveView } from "../visualisations/hive";
import { useLocation, useParams } from "react-router-dom";

const ClassroomAnalyticsHive = () => {
  const { range } = useTimeline();
  let location = useLocation();
  const { simulationId } = useParams();

  const simulationDec = location.state.name;

  console.log(location.state);

  return (
    <>
      <h1>
        {simulationId}: {simulationDec}
      </h1>
      <HiveView timeRange={range} projectCode="peninsulaNursing" />
      <TimelineVisualisation />
    </>
  );
};

export default ClassroomAnalyticsHive;
