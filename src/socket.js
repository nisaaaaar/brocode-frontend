import { io } from "socket.io-client";

// Point this to your Flask server
export const socket = io("https://brocode-backend-sk08.onrender.com", {
// export const socket = io("https://brocode-backend-sk08.onrender.com", {
  autoConnect: false,
  transports: ["websocket"]
});
