import { io } from "socket.io-client";

console.log(process.env.REACT_APP_URL);

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : process.env.REACT_APP_URL;

export const socket = io(URL);
