import { io } from "socket.io-client";

// Point this to your Flask server
// export const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
export const socket = io(process.env.REACT_APP_BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket"]
});
