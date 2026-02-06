"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Multiplayer() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  function createRoom() {
    if (!name.trim()) {
      alert("Enter your name");
      return;
    }

    const newRoom = Math.random().toString(36).slice(2, 8);
    router.push(`/room?roomId=${newRoom}&name=${encodeURIComponent(name)}`);
  }

  function joinRoom() {
    if (!name.trim() || !room.trim()) {
      alert("Enter name and room code");
      return;
    }

    router.push(`/room?roomId=${room.trim()}&name=${encodeURIComponent(name)}`);
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h2>Typing Rooms - Multiplayer</h2>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Room code"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={createRoom}>Create room</button>
        <button onClick={joinRoom} style={{ marginLeft: 10 }}>
          Join room
        </button>
        <button onClick={createRoom} style={{ marginLeft: 10 }}>
          Play with friends
        </button>
      </div>
    </div>
  );
}
