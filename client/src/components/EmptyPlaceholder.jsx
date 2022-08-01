const EmptyPlaceholder = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <h1>🔍</h1>
      <label>No Information.</label>
    </div>
  );
};

export default EmptyPlaceholder;
