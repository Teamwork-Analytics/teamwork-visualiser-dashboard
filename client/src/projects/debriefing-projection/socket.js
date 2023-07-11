// See https://socket.io/how-to/use-with-react for more

import { io } from "socket.io-client";
// const IP_ADDRESS = "49.127.8.22";
const IP_ADDRESS = "49.127.43.80";
// "192.168.20.29";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? undefined
    : `http://${IP_ADDRESS}:3000`;

// when client and server at the same domain
export const socket = io(URL);
// if client and server at different domain
// const socket = io("https://server-domain.com");
// see https://socket.io/docs/v4/client-initialization/ for more
