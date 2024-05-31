import { useEffect, useState } from "react";
import { getCoTeachingStory } from "../../../services/py-server";
import { useTimeline } from "../../observation/visualisationComponents/TimelineContext";
import { useParams } from "react-router-dom";
import { CoTeachToolTips } from "./enums";
import { useCoTeachViz } from "./CoTeachVizContext";
import { Tooltip } from "react-tooltip";
import { useTracking } from "react-tracking";
import { mainBoxStyles } from "./styles";
import { Spinner } from "react-bootstrap";

const DataStorytellingBox = () => {
  const { coTeachVizState } = useCoTeachViz();
  const [isLoading, setIsLoading] = useState(true);
  const { Track, trackEvent } = useTracking({ page: "Classroom Analytics" });

  const styles = {
    container: {
      minHeight: "6em",
      width: "30em",
      backgroundColor: "white",
      border: "2px solid lightgrey",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      margin: "0.2em",
    },
  };
  const { range } = useTimeline();
  const { simulationId } = useParams();
  const startTime = range[0];
  const endTime = range[1];
  const [text, setText] = useState("No story to tell.");

  useEffect(() => {
    const getSelectedFilter = (preselectedLables) => {
      for (const key in coTeachVizState) {
        if (coTeachVizState[key] === true) {
          if (preselectedLables.includes(key)) {
            return key;
          }
        }
      }
      return null;
    };

    async function callData() {
      try {
        setIsLoading(true);
        const res = await getCoTeachingStory({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
          taColour: getSelectedFilter(["RED", "GREEN", "BLUE"]),
          spatial: getSelectedFilter([
            "authoritative",
            "supervisory",
            "interactional",
            "personal",
          ]),
        });
        if (res.status === 200) {
          setText(res.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(true);
      }
    }
    callData();
  }, [simulationId, startTime, endTime, coTeachVizState]);

  return (
    <div style={styles.container}>
      <small style={{ fontSize: "0.8em" }}>
        <b>Co-teaching Strategy</b>
      </small>

      {!isLoading ? (
        <p
          onMouseEnter={() => {
            trackEvent({
              action: "hover-enter",
              element: "dataStorytellingParagraph",
              data: text,
            });
          }}
          onMouseLeave={() => {
            trackEvent({
              action: "hover-leave",
              element: "dataStorytellingParagraph",
              data: text,
            });
          }}
          style={{
            padding: "1em",
            textAlign: "left",
            paddingTop: 0,
            marginBottom: "0",
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <div style={mainBoxStyles.loading}>
          <Spinner size={"sm"} />
          Loading...
        </div>
      )}
      <small style={{ color: "#5a5a5a", fontSize: "0.8em" }}>
        <b>*% of the selected period with time slider</b>
      </small>

      {Object.keys(CoTeachToolTips).map((e) => (
        <Tooltip id={e} place="top" className="tooltip">
          {CoTeachToolTips[e]}
        </Tooltip>
      ))}
      {/* <p data-tooltip-id="one-teacher-one-observer" data-tooltip-place="top">
        Blehh
      </p> */}
    </div>
  );
};
export default DataStorytellingBox;
