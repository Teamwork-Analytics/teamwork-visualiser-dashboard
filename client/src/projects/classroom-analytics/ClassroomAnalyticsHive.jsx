import { useState } from "react";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import { TimeSliderController } from "../observation/visualisationComponents/TimelineVisualisation";
import { HiveView } from "../visualisations/hive";
import { useLocation, useParams } from "react-router-dom";
import { useTracking } from "react-tracking";
import { Row, Col } from "react-bootstrap";
import { CoTeachVizView } from "../visualisations/coTeachViz";

const ClassroomAnalyticsHive = () => {
  const { range } = useTimeline();
  const { Track, trackEvent } = useTracking({ page: "Classroom Analytics" });

  const PROJECT_CODE = "classroomAnalytics2024"; // peninsulaNursing
  let location = useLocation();
  const { simulationId } = useParams();

  const simulationDec = location.state.name;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    visualisationsContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  return (
    <Track>
      <div style={styles.container}>
        <h2>
          {simulationId}: {simulationDec}
        </h2>
        <div style={styles.visualisationsContainer}>
          <HiveView
            timeRange={range}
            projectCode={PROJECT_CODE}
            height="30em" // default height
            width="45vw"
            showFilter={false}
          />
          <CoTeachVizView />
        </div>
        <div style={{ width: "80vw", marginTop: "-5em" }}>
          <TimeSliderController trackEvent={trackEvent} />
        </div>
      </div>
    </Track>
  );
};

export default ClassroomAnalyticsHive;
