import { useEffect, useState } from "react";
import { getCoTeachingStory } from "../../../services/py-server";
import { useTimeline } from "../../observation/visualisationComponents/TimelineContext";
import { useParams } from "react-router-dom";
import { CoTeachToolTips } from "./enums";
import { useCoTeachViz } from "./CoTeachVizContext";
import { Tooltip } from "react-tooltip";

const DataStorytellingBox = () => {
  const { coTeachVizState } = useCoTeachViz();
  const [isLoading, setIsLoading] = useState(false);

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
          // setIsError(false);
        }
      } catch (error) {
        console.log(error);
        // setIsError(true);
      }
    }
    callData();
  }, [simulationId, startTime, endTime, coTeachVizState]);

  return (
    <div style={styles.container}>
      <small style={{ textAlign: "right" }}>
        <b>Team-teaching</b>
      </small>
      <p
        style={{
          padding: "1em",
          textAlign: "left",
          paddingTop: 0,
          marginBottom: "0",
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {Object.keys(CoTeachToolTips).map((e) => (
        <Tooltip id={e} place="top">
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
