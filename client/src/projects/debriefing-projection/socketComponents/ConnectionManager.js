import { taggingSocket } from "../socket";

export default function ConnectionManager() {
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
