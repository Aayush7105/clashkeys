"use client";

import { io } from "socket.io-client";

const configuredSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
const socketUrl =
  configuredSocketUrl && configuredSocketUrl.length > 0
    ? configuredSocketUrl.replace(/\/+$/, "")
    : process.env.NODE_ENV === "production"
      ? undefined
      : "http://localhost:4000";

const SOCKET_WARMUP_PATH = "/health";
const DEFAULT_WARMUP_TIMEOUT_MS = 1800;
const WARMUP_ATTEMPT_DELAYS_MS = [0, 1500, 3500] as const;
const MIN_PRIME_GAP_MS = 3000;

let lastPrimeAt = 0;
let reconnectNudgeTimer: ReturnType<typeof setTimeout> | null = null;

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["polling", "websocket"],
  rememberUpgrade: process.env.NODE_ENV === "production",
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
  randomizationFactor: 0.25,
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

function warmupSocketService(origin: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(`${origin}${SOCKET_WARMUP_PATH}?warmup=${Date.now()}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    keepalive: true,
    signal: controller.signal,
  })
    .catch(() => undefined)
    .finally(() => clearTimeout(timeoutId));
}

function nudgeConnect(delayMs: number) {
  if (reconnectNudgeTimer) {
    clearTimeout(reconnectNudgeTimer);
  }

  reconnectNudgeTimer = setTimeout(() => {
    reconnectNudgeTimer = null;
    if (!socket.connected) {
      socket.connect();
    }
  }, delayMs);
}

if (process.env.NODE_ENV === "production" && !socketUrl) {
  // Surface missing backend socket config early in production builds.
  console.warn(
    "[socket] NEXT_PUBLIC_SOCKET_URL is missing; realtime falls back to same-origin."
  );
}

export function primeRealtimeConnection(timeoutMs = DEFAULT_WARMUP_TIMEOUT_MS) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (now - lastPrimeAt < MIN_PRIME_GAP_MS) {
    if (!socket.connected) {
      socket.connect();
    }
    return;
  }
  lastPrimeAt = now;

  if (!socket.connected) {
    socket.connect();
    nudgeConnect(2500);
  }

  const origin = resolveSocketOrigin();
  if (!origin) return;

  WARMUP_ATTEMPT_DELAYS_MS.forEach((delayMs) => {
    setTimeout(() => {
      void warmupSocketService(origin, timeoutMs).then(() => {
        if (!socket.connected) {
          socket.connect();
        }
      });
    }, delayMs);
  });
}

