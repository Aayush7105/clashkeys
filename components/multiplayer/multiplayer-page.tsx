"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { socket } from "@/lib/socket";

// "
export default function MultiplayerPage() {
  const router = useRouter();
  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    router.prefetch("/room");
    if (!socket.connected) {
      socket.connect();
    }
  }, [router]);

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

    if (!socket.connected) {
      socket.connect();
    }

    const newRoom = makeRoomCode();
    router.push(
      `/room?roomId=${encodeURIComponent(newRoom)}&name=${encodeURIComponent(
        name,
      )}`,
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

    if (!socket.connected) {
      socket.connect();
    }

    router.push(
      `/room?roomId=${encodeURIComponent(normalized)}&name=${encodeURIComponent(
        name,
      )}`,
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-200 flex items-center justify-center px-6">
      <div className="pointer-events-none absolute -top-32 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.3),rgba(10,10,10,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.45),rgba(10,10,10,0))]" />

      <div className="relative max-w-3xl w-full space-y-10">
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-neutral-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-full text-neutral-300 hover:text-[#e2b714]"
            >
              <IoMdArrowRoundBack className="size-5" />
            </button>
            <span className="font-mono text-lg font-semibold">Multiplayer</span>
          </div>
          <span className="text-[#e2b714] text-lg font-mono font-semibold">
            clashkeys
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] font-mono">
          <h2 className="text-2xl sm:text-4xl font-semibold">Typing Rooms</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Create a room or join with a 4-digit code.
          </p>
          <div className="flex justify-center items-center">
            <div className="mt-6 flex gap-2 bg-neutral-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setMode("create")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                  mode === "create"
                    ? "bg-[#e2b714] text-black"
                    : "text-neutral-400"
                }`}
              >
                Create Room
              </button>

              <button
                onClick={() => setMode("join")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                  mode === "join"
                    ? "bg-[#e2b714] text-black"
                    : "text-neutral-400"
                }`}
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="mt-6 grid gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm uppercase tracking-[0.2em]">
                Your name
              </label>
              <input
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-600 px-4 py-3 text-sm outline-none focus:border-[#e2b714]"
              />
            </div>

            {/* Room (only for join) */}
            {mode === "join" && (
              <div>
                <label className="block text-sm uppercase tracking-[0.2em]">
                  Room code
                </label>
                <input
                  placeholder="#1234"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-600 px-4 py-3 text-sm outline-none focus:border-[#e2b714]"
                />
              </div>
            )}
          </div>

          {/* Button */}
          <div className="mt-6">
            {mode === "create" ? (
              <button
                onClick={createRoom}
                disabled={!name}
                className="w-full rounded-xl bg-[#e2b714] px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
              >
                Create Room
              </button>
            ) : (
              <button
                onClick={joinRoom}
                disabled={!name || !room}
                className="w-full rounded-xl border border-[#3a3f49] px-5 py-2.5 text-sm font-semibold hover:border-[#e2b714] disabled:opacity-50"
              >
                Join Room
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[#6b6f7a] font-mono">
          Tip: Codes are four digits (e.g. 1234)
        </p>
      </div>
    </main>
  );
}
