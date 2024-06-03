import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
import { TimeSliderController } from "../observation/visualisationComponents/TimelineVisualisation";
import { HiveView } from "../visualisations/hive";
import { useLocation, useParams } from "react-router-dom";
import { useTracking } from "react-tracking";
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
      marginTop: "1em",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  return (
    <Track>
      <div style={styles.container}>
        <h3>
          {simulationId}: {simulationDec}
        </h3>
        <div style={{ width: "75vw", marginBottom: "1em", marginTop: "1em" }}>
          <TimeSliderController trackEvent={trackEvent} />
        </div>
        <div style={styles.visualisationsContainer}>
          <HiveView
            timeRange={range}
            projectCode={PROJECT_CODE}
            height="30em" // default height
            width="40vw"
            showFilter={false}
          />
          <CoTeachVizView />
        </div>
      </div>
    </Track>
  );
};

export default ClassroomAnalyticsHive;
