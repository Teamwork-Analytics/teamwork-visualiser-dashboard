import { taggingSocket } from "../socket";

export function ConnectionManager() {
  function connect() {
    taggingSocket.connect();
  }

  function disconnect() {
    taggingSocket.disconnect();
  }

  return (
    <>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </>
  );
}
