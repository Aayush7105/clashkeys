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
  transports: ["websocket", "polling"],
  rememberUpgrade: process.env.NODE_ENV === "production",
});

function resolveSocketOrigin() {
  if (socketUrl && socketUrl.length > 0) {
    return socketUrl;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return undefined;
}

export function primeRealtimeConnection(timeoutMs = 1200) {
  if (typeof window === "undefined") return;

  if (!socket.connected) {
    socket.connect();
  }

  const origin = resolveSocketOrigin();
  if (!origin) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  void fetch(`${origin}/?warmup=${Date.now()}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    keepalive: true,
    signal: controller.signal,
  })
    .catch(() => undefined)
    .finally(() => clearTimeout(timeoutId));
}

