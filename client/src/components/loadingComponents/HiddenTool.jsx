/**
 * @file Represents a component indicating that the tool is hidden (from studnet)
 */

const HiddenTool = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        margin: "auto",
      }}
    >
      <h2>Tool hidden ⏳</h2>
      <p>Please log in as a teacher to use the tool</p>
    </div>
  );
};

export default HiddenTool;
