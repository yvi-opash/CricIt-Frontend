import { io, type Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

/**
 * Connect only when a page that needs realtime actually mounts.
 * Eager `io()` at module load ran for every route (because Home is in the bundle),
 * which starved Render free-tier connections and broke unrelated API calls.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
