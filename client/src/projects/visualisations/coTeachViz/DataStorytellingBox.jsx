import { useState } from "react";

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
        Data Storytelling text here. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Donec dui elit, ultrices consequat maximus nec,
        molestie viverra ante. In massa arcu, dictum eget ex eget, placerat
        pulvinar sem.
      </p>
    </div>
  );
};
export default DataStorytellingBox;
