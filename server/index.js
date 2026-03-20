import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 4000;

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function parseAllowedOrigins() {
  const rawOrigins = process.env.FRONTEND_ORIGIN ?? process.env.CORS_ORIGIN ?? "";
  const parsed = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ""));

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

const allowedOrigins = parseAllowedOrigins();

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function setNoStoreHeaders(res) {
  res.set(noStoreHeaders);
}

function getHealthPayload() {
  return {
    status: "ok",
    service: "clashkeys-socket",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  };
}

app.get("/", (_req, res) => {
  setNoStoreHeaders(res);
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  setNoStoreHeaders(res);
  res.status(200).json(getHealthPayload());
});

app.head("/health", (_req, res) => {
  setNoStoreHeaders(res);
  res.sendStatus(200);
});

// Backward-compatible alias so monitors using /api/health still work on Render.
app.get("/api/health", (_req, res) => {
  setNoStoreHeaders(res);
  res.status(200).json(getHealthPayload());
});

app.head("/api/health", (_req, res) => {
  setNoStoreHeaders(res);
  res.sendStatus(200);
});

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Socket CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST"],
  },
});

const DEFAULT_DURATION = 30;
const DEFAULT_MODE = "words";
const rooms = {};
const ALLOWED_DURATIONS = new Set([15, 30, 60, 120]);
const ALLOWED_MODES = new Set([
  "words",
  "punctuation",
  "numbers",
  "quote",
  "code",
]);

function normalizeDuration(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_DURATION;
  return ALLOWED_DURATIONS.has(parsed) ? parsed : DEFAULT_DURATION;
}

function normalizeProgress(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function normalizeCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

function normalizeMode(value) {
  if (typeof value !== "string") return DEFAULT_MODE;
  return ALLOWED_MODES.has(value) ? value : DEFAULT_MODE;
}

function sanitizeTextByMode(value, mode) {
  if (typeof value !== "string") return "";
  if (mode === "punctuation") {
    return value
      .toLowerCase()
      .replace(/[^a-z\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "numbers") {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s.,:%/-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "quote") {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "code") {
    return value
      .replace(/\r\n?/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/[^A-Za-z0-9\n .,?!:;'"(){}\[\]<>_=+\-*/%`$&|]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd();
  }
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getModeFallback(mode) {
  if (mode === "punctuation") {
    return "ready? type this line exactly; punctuation matters!";
  }
  if (mode === "numbers") {
    return "version 2.4.1 released at 09:30 with 25% faster load times";
  }
  if (mode === "quote") {
    return "the journey of a thousand miles begins with a single step";
  }
  if (mode === "code") {
    return `for (let i = 0; i < items.length; i++) {
  if (items[i] > 0) {
    total += items[i];
  }
}`;
  }
  return "the quick brown fox jumps over the lazy dog";
}

function serializeUsers(room) {
  return room.users.map((u) => ({
    id: u.socketId,
    name: u.name,
    progress: u.progress,
    correctChars: u.correctChars,
    totalKeystrokes: u.totalKeystrokes,
  }));
}

function getOrCreateRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [],
      duration: DEFAULT_DURATION,
      mode: DEFAULT_MODE,
    };
  }

  const room = rooms[roomId];
  room.duration = normalizeDuration(room.duration);
  room.mode = normalizeMode(room.mode);
  return room;
}

function emitRoomSettings(roomId, room) {
  io.to(roomId).emit("room-settings-update", {
    duration: room.duration,
    mode: room.mode,
  });
}

function removeSocketFromRoom(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return false;

  const before = room.users.length;
  room.users = room.users.filter((u) => u.socketId !== socketId);

  if (room.users.length !== before) {
    io.to(roomId).emit("room-users-update", serializeUsers(room));
  }

  if (room.users.length === 0) {
    delete rooms[roomId];
  }

  return room.users.length !== before;
}

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    const nextRoomId = typeof roomId === "string" ? roomId.trim() : "";
    const nextName = typeof name === "string" ? name.trim() : "";
    if (!nextRoomId || !nextName) return;

    const previousRoomId =
      typeof socket.data.roomId === "string" ? socket.data.roomId : "";
    if (previousRoomId && previousRoomId !== nextRoomId) {
      removeSocketFromRoom(previousRoomId, socket.id);
      socket.leave(previousRoomId);
    }

    socket.join(nextRoomId);
    socket.data.roomId = nextRoomId;
    const room = getOrCreateRoom(nextRoomId);

    // Avoid duplicate entries if join-room fires twice (e.g., React strict mode)
    room.users = room.users.filter((u) => u.socketId !== socket.id);

    room.users.push({
      socketId: socket.id,
      name: nextName,
      progress: 0,
      correctChars: 0,
      totalKeystrokes: 0,
    });

    io.to(nextRoomId).emit("room-users-update", serializeUsers(room));
    emitRoomSettings(nextRoomId, room);
  });

  socket.on("user-typing", ({ roomId, progress, correctChars, totalKeystrokes }) => {
    const room = rooms[roomId];
    if (!room) return;

    const user = room.users.find((u) => u.socketId === socket.id);
    if (!user) return;

    user.progress = normalizeProgress(progress);
    user.correctChars = normalizeCount(correctChars);
    user.totalKeystrokes = normalizeCount(totalKeystrokes);

    io.to(roomId).emit("progress-update", serializeUsers(room));
  });

  socket.on("room-settings-update", ({ roomId, duration, mode }) => {
    const room = rooms[roomId];
    if (!room) return;

    const hostSocketId = room.users[0]?.socketId;
    if (!hostSocketId || hostSocketId !== socket.id) return;

    room.duration =
      duration === undefined ? room.duration : normalizeDuration(duration);
    room.mode = mode === undefined ? room.mode : normalizeMode(mode);

    emitRoomSettings(roomId, room);
  });

  socket.on("start-test", ({ roomId, text, duration, mode }) => {
    const room = rooms[roomId];
    if (!room) return;
    const nextDuration = normalizeDuration(duration);
    const nextMode = normalizeMode(mode);
    const nextText = sanitizeTextByMode(text, nextMode) || getModeFallback(nextMode);
    const startedAt = Date.now();
    room.duration = nextDuration;
    room.mode = nextMode;

    room.users.forEach((u) => {
      u.progress = 0;
      u.correctChars = 0;
      u.totalKeystrokes = 0;
    });

    io.to(roomId).emit("test-started", {
      text: nextText,
      duration: nextDuration,
      mode: nextMode,
      startedAt,
      users: serializeUsers(room),
    });
  });

  socket.on("leave-room", ({ roomId } = {}) => {
    const requestedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    const activeRoomId =
      requestedRoomId ||
      (typeof socket.data.roomId === "string" ? socket.data.roomId : "");
    if (!activeRoomId) return;

    removeSocketFromRoom(activeRoomId, socket.id);
    socket.leave(activeRoomId);

    if (socket.data.roomId === activeRoomId) {
      socket.data.roomId = undefined;
    }
  });

  socket.on("disconnect", () => {
    const activeRoomId =
      typeof socket.data.roomId === "string" ? socket.data.roomId : "";
    if (activeRoomId) {
      removeSocketFromRoom(activeRoomId, socket.id);
      return;
    }

    for (const roomId of Object.keys(rooms)) {
      if (removeSocketFromRoom(roomId, socket.id)) {
        return;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
