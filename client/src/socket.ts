import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

/** Prefer WebSocket over polling to avoid slow long-polling XHRs on every tick. */
export const socket = io(URL, {
  transports: ["websocket", "polling"],
});
