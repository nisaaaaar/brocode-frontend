import { io } from "socket.io-client";

// Point this to your Flask server
export const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"]
});
