"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MultiplayerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  function makeRoomCode() {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    return `#${code}`;
  }

  function normalizeRoomCode(input: string) {
    const digits = input.replace(/[^0-9]/g, "");
    if (digits.length === 4) {
      return `#${digits}`;
    }
    return "";
  }

  function createRoom() {
    if (!name.trim()) {
      alert("Enter your name");
      return;
    }

    const newRoom = makeRoomCode();
    router.push(
      `/room?roomId=${encodeURIComponent(newRoom)}&name=${encodeURIComponent(
        name
      )}`
    );
  }

  function joinRoom() {
    if (!name.trim() || !room.trim()) {
      alert("Enter name and room code");
      return;
    }

    const normalized = normalizeRoomCode(room);
    if (!normalized) {
      alert("Room code must be 4 digits");
      return;
    }

    router.push(
      `/room?roomId=${encodeURIComponent(normalized)}&name=${encodeURIComponent(
        name
      )}`
    );
  }

  return (
    <main className="min-h-screen bg-[#1a1b1f] text-[#e2e2e2] flex items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-10">
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a]">
          <span>Multiplayer</span>
          <span className="text-[#e2b714]">clashkeys</span>
        </div>

        <div className="rounded-2xl border border-[#2a2d34] bg-[#202227] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-wide">
            Typing Rooms
          </h2>
          <p className="mt-2 text-sm text-[#6b6f7a]">
            Create a room or join with a 4-digit code.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-[#6b6f7a]">
                Your name
              </label>
              <input
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg bg-[#1a1b1f] border border-[#2a2d34] px-4 py-3 text-sm tracking-wide outline-none focus:border-[#e2b714]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-[#6b6f7a]">
                Room code
              </label>
              <input
                placeholder="#1234"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-2 w-full rounded-lg bg-[#1a1b1f] border border-[#2a2d34] px-4 py-3 text-sm tracking-wide outline-none focus:border-[#e2b714]"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={createRoom}
              className="rounded-lg bg-[#e2b714] px-5 py-2.5 text-sm font-semibold text-[#1a1b1f] tracking-wide hover:brightness-110"
            >
              Create room
            </button>
            <button
              onClick={joinRoom}
              className="rounded-lg border border-[#3a3f49] px-5 py-2.5 text-sm font-semibold tracking-wide text-[#e2e2e2] hover:border-[#e2b714]"
            >
              Join room
            </button>
            <button
              onClick={createRoom}
              className="rounded-lg border border-[#3a3f49] px-5 py-2.5 text-sm font-semibold tracking-wide text-[#e2e2e2] hover:border-[#e2b714]"
            >
              Play with friends
            </button>
          </div>
        </div>

        <p className="text-center text-sm tracking-wide text-[#6b6f7a]">
          Tip: Codes are four digits (e.g. #1234)
        </p>
      </div>
    </main>
  );
}
