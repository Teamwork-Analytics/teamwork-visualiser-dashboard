// See https://socket.io/how-to/use-with-react for more

import { io } from "socket.io-client";
const IP_ADDRESS = process.env.REACT_APP_EXPRESS_IP;
const PORT = process.env.REACT_APP_EXPRESS_PORT;
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : `${IP_ADDRESS}:${PORT}`;

// when client and server at the same domain
export const socket = io(URL);
// if client and server at different domain
// const socket = io("https://server-domain.com");
// see https://socket.io/docs/v4/client-initialization/ for more
