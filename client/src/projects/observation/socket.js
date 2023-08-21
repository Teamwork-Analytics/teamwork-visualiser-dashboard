// See https://socket.io/how-to/use-with-react for more

import { io } from "socket.io-client";
const IP_ADDRESS = process.env.REACT_APP_EXPRESS_IP;
const PORT = process.env.REACT_APP_EXPRESS_PORT;
// "undefined" means the URL will be computed from the `window.location` object
const URL = `${IP_ADDRESS}:${PORT}`;

// Create a separate socket connection for the 'tagging' namespace
export const taggingSocket = io(`${URL}/tagging`);
