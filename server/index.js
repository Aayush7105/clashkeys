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
    });

    io.to(roomId).emit(
      "room-users-update",
      rooms[roomId].users.map((u) => ({
        id: u.socketId,
        name: u.name,
        progress: u.progress,
      })),
    );
  });

  socket.on("user-typing", ({ roomId, progress }) => {
    const room = rooms[roomId];
    if (!room) return;

    const user = room.users.find((u) => u.socketId === socket.id);
    if (!user) return;

    user.progress = progress;

    io.to(roomId).emit(
      "progress-update",
      room.users.map((u) => ({
        id: u.socketId,
        name: u.name,
        progress: u.progress,
      })),
    );
  });

  socket.on("start-test", ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.users.forEach((u) => {
      u.progress = 0;
    });

    io.to(roomId).emit("test-started", {
      text,
      users: room.users.map((u) => ({
        id: u.socketId,
        name: u.name,
        progress: u.progress,
      })),
    });
  });

  socket.on("disconnect", () => {
    for (const roomId of Object.keys(rooms)) {
      const room = rooms[roomId];
      const before = room.users.length;

      room.users = room.users.filter((u) => u.socketId !== socket.id);

      if (room.users.length !== before) {
        io.to(roomId).emit(
          "room-users-update",
          room.users.map((u) => ({
            id: u.socketId,
            name: u.name,
            progress: u.progress,
          })),
        );
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
