export function ConnectionState({ isConnected }) {
  return (
    <>
      <p style={{ fontSize: "8px", margin: "0px" }}>
        {!isConnected && "Not connected."}
      </p>
    </>
  );
}
