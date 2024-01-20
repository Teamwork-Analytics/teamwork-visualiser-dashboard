/**
 * @file Represents a component indicating that the tool is in preparation
 */

/**
 * @component This is a component that displays a message indicating that the tool is in
 * preparation and suggests to the user to reload the page in a few minutes.
 */
const ToolInPrep = () => {
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
      <h2>Tool in preparation ⏳</h2>
      <p>Reload the page in a few minutes</p>
    </div>
  );
};

export default ToolInPrep;
