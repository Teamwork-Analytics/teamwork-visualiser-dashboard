import { useEffect, useState } from "react";
import { getCoTeachingStory } from "../../../services/py-server";
import { useTimeline } from "../../observation/visualisationComponents/TimelineContext";
import { useParams } from "react-router-dom";

const DataStorytellingBox = () => {
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
    async function callData() {
      try {
        const res = await getCoTeachingStory({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
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
  }, [simulationId, startTime, endTime]);

  return (
    <div style={styles.container}>
      <small style={{ textAlign: "right" }}>
        <b>Co-teaching</b>
      </small>
      <p
        style={{
          padding: "1em",
          textAlign: "left",
          paddingTop: 0,
          marginBottom: "0",
        }}
      >
        {text}
      </p>
    </div>
  );
};
export default DataStorytellingBox;
