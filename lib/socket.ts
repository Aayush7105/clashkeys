"use client";

import { io } from "socket.io-client";

const configuredSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
const socketUrl =
  configuredSocketUrl && configuredSocketUrl.length > 0
    ? configuredSocketUrl.replace(/\/+$/, "")
    : process.env.NODE_ENV === "production"
      ? undefined
      : "http://localhost:4000";

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["polling", "websocket"],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
});

