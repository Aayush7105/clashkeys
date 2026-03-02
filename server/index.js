import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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
  if (!Number.isFinite(parsed)) return 30;
  return ALLOWED_DURATIONS.has(parsed) ? parsed : 30;
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
  if (typeof value !== "string") return "words";
  return ALLOWED_MODES.has(value) ? value : "words";
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

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId || !name) return;

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: [] };
    }

    // Avoid duplicate entries if join-room fires twice (e.g., React strict mode)
    rooms[roomId].users = rooms[roomId].users.filter(
      (u) => u.socketId !== socket.id,
    );

    rooms[roomId].users.push({
      socketId: socket.id,
      name,
      progress: 0,
      correctChars: 0,
      totalKeystrokes: 0,
    });

    io.to(roomId).emit("room-users-update", serializeUsers(rooms[roomId]));
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

  socket.on("start-test", ({ roomId, text, duration, mode }) => {
    const room = rooms[roomId];
    if (!room) return;
    const nextDuration = normalizeDuration(duration);
    const nextMode = normalizeMode(mode);
    const nextText = sanitizeTextByMode(text, nextMode) || getModeFallback(nextMode);
    const startedAt = Date.now();

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

  socket.on("disconnect", () => {
    for (const roomId of Object.keys(rooms)) {
      const room = rooms[roomId];
      const before = room.users.length;

      room.users = room.users.filter((u) => u.socketId !== socket.id);

      if (room.users.length !== before) {
        io.to(roomId).emit("room-users-update", serializeUsers(room));
      }

      if (room.users.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

server.listen(4000, () => {
  console.log("Server running on 4000");
});
