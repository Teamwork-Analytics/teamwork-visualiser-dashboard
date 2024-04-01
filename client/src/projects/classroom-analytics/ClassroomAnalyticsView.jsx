/**
 * @file Classroom Analytics view Component
 *
 * @description
 */

import { useState, useEffect } from "react";
import { TimelineProvider } from "../observation/visualisationComponents/TimelineContext";
import { HiveProvider } from "../visualisations/hive/HiveContext";
import { useParams } from "react-router-dom";
import ClassroomAnalyticsHive from "./ClassroomAnalyticsHive";

const ClassroomAnalyticsView = () => {
  const { simulationId } = useParams();

  return (
    <>
      <div>
        <TimelineProvider simulationId={simulationId}>
          <HiveProvider simulationId={simulationId}>
            <ClassroomAnalyticsHive />
          </HiveProvider>

          {/* Display the selected visualisations with the received range */}
        </TimelineProvider>
      </div>
    </>
  );
};

export default ClassroomAnalyticsView;
