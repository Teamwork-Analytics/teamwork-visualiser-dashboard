import { useState } from "react";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import TimelineVisualisation from "../observation/visualisationComponents/TimelineVisualisation";
import { HiveView } from "../visualisations/hive";
import { useLocation, useParams } from "react-router-dom";

const ClassroomAnalyticsHive = () => {
  const { range } = useTimeline();

  const PROJECT_CODE = "classroomAnalytics2024"; // peninsulaNursing
  let location = useLocation();
  const { simulationId } = useParams();

  const simulationDec = location.state.name;

  return (
    <>
      <h1>
        {simulationId}: {simulationDec}
      </h1>
      <HiveView
        timeRange={range}
        projectCode={PROJECT_CODE}
        height="50vh" // default height
        width="50vw"
      />
      <TimelineVisualisation />
    </>
  );
};

export default ClassroomAnalyticsHive;
