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

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

  socket.on("start-test", ({ roomId, text, duration }) => {
    const room = rooms[roomId];
    if (!room) return;
    const nextDuration = normalizeDuration(duration);
    const nextText = sanitizeText(text);
    const startedAt = Date.now();

    room.users.forEach((u) => {
      u.progress = 0;
      u.correctChars = 0;
      u.totalKeystrokes = 0;
    });

    io.to(roomId).emit("test-started", {
      text: nextText,
      duration: nextDuration,
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
