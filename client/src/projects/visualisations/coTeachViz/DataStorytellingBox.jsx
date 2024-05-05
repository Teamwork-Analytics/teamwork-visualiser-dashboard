const DataStorytellingBox = () => {
  const styles = {
    container: {
      height: "6em",
      width: "30em",
      backgroundColor: "lightgrey",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0.2em",
    },
  };
  return (
    <div style={styles.container}>
      <p>Data Storytelling text here.</p>
    </div>
  );
};
export default DataStorytellingBox;
