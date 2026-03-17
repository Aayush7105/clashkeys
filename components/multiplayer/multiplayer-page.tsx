/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { socket } from "@/lib/socket";

export default function MultiplayerPage() {
  const router = useRouter();

  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    router.prefetch("/room");
    if (!socket.connected) socket.connect();
  }, [router]);

  function makeRoomCode() {
    return `#${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function normalizeRoomCode(input: string) {
    const digits = input.replace(/[^0-9]/g, "");
    return digits.length === 4 ? `#${digits}` : "";
  }

  function handleModeChange(newMode: SetStateAction<string>) {
    setMode(newMode);
  }

  function createRoom() {
    if (!name.trim()) {
      alert("Enter your name");
      return;
    }

    const newRoom = makeRoomCode();
    router.push(
      `/room?roomId=${encodeURIComponent(newRoom)}&name=${encodeURIComponent(
        name,
      )}`,
    );
  }

  function joinRoom() {
    const normalized = normalizeRoomCode(room);

    if (!name.trim() || !normalized) {
      alert("Enter valid name & 4-digit code");
      return;
    }

    router.push(
      `/room?roomId=${encodeURIComponent(normalized)}&name=${encodeURIComponent(
        name,
      )}`,
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-200 flex items-center justify-center px-6">
      {/* Background */}
      <div className="pointer-events-none absolute -top-32 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.3),rgba(10,10,10,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.45),rgba(10,10,10,0))]" />

      <div className="relative max-w-xl w-full space-y-8">
        {/* Header */}
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-neutral-400"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-neutral-300 hover:text-[#e2b714]"
            >
              <IoMdArrowRoundBack className="size-5" />
            </button>
            <span className="font-mono text-lg font-semibold">Multiplayer</span>
          </div>

          <span className="text-[#e2b714] text-lg font-mono font-semibold">
            clashkeys
          </span>
        </motion.div>

        {/* Card */}
        <motion.div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] font-mono min-h-80 flex flex-col justify-between">
          {/* Top (STATIC) */}
          <div>
            <h2 className="text-xl sm:text-3xl font-semibold text-center">
              Typing Rooms
            </h2>
            <p className="mt-2 text-sm text-neutral-400 text-center">
              Create a room or join with a 4-digit code.
            </p>

            {/* Toggle */}
            <div className="flex justify-center mt-6">
              <div className="relative flex bg-neutral-800 p-1 rounded-lg overflow-hidden">
                {/* Sliding pill */}
                {mode === "create" ? (
                  <motion.div
                    layoutId="toggle-pill"
                    className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-[#e2b714] rounded-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : (
                  <motion.div
                    layoutId="toggle-pill"
                    className="absolute inset-y-1 right-1 w-[calc(50%-4px)] bg-[#e2b714] rounded-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <button
                  onClick={() => setMode("create")}
                  className={`relative z-10 px-4 py-1.5 text-sm font-semibold ${
                    mode === "create" ? "text-black" : "text-neutral-400"
                  }`}
                >
                  Create Room
                </button>

                <button
                  onClick={() => setMode("join")}
                  className={`relative z-10 px-4 py-1.5 text-sm font-semibold ${
                    mode === "join" ? "text-black" : "text-neutral-400"
                  }`}
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>

          {/* Bottom (EXPANDING AREA) */}
          <div className="mt-4">
            <motion.div
              layout
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              {/* Name */}
              <div>
                <label className="block text-sm uppercase tracking-[0.2em]">
                  Your name
                </label>
                <input
                  placeholder="Type your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-600 px-4 py-2.5 text-sm outline-none focus:border-[#e2b714]"
                />
              </div>

              {/* Room Input */}
              <AnimatePresence>
                {mode === "join" && (
                  <motion.div
                    layout
                    key="room"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="block text-sm uppercase tracking-[0.2em]">
                      Room code
                    </label>
                    <input
                      placeholder="#your room code"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-600 px-4 py-2.5 text-sm outline-none focus:border-[#e2b714]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={mode === "create" ? createRoom : joinRoom}
                className={`w-full rounded-xl px-5 py-3 text-sm font-semibold mt-2 ${
                  mode === "create"
                    ? "bg-[#e2b714] text-black"
                    : "border border-[#3a3f49] text-neutral-200 hover:border-[#e2b714]"
                }`}
              >
                {mode === "create" ? "Create Room" : "Join Room"}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
        {mode == "join" && (
          <p className="text-center text-sm text-[#6b6f7a] font-mono">
            Tip: Codes are four digits (e.g. 1234)
          </p>
        )}
        {mode == "create" && (
          <p className="text-center text-sm text-[#6b6f7a] font-mono">
            Create a room and invite your friends
          </p>
        )}
      </div>
    </main>
  );
}
