"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import ScorePage from "@/components/score/scorepage";
import WaitingRoomPage from "@/components/room/roompage";

type RoomUser = {
  id: string;
  name: string;
  progress: number;
};

const defaultText =
  "This is a simple multiplayer typing test for the prototype.";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function RoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams.get("roomId") ?? "";
  const rawName = searchParams.get("name") ?? "";
  const name = useMemo(() => safeDecode(rawName), [rawName]);

  const [users, setUsers] = useState<RoomUser[]>([]);
  const [text, setText] = useState(defaultText);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  const ready = roomId.trim().length > 0 && name.trim().length > 0;
  const hostId = users[0]?.id ?? null;
  const isHost = Boolean(hostId && socketId && hostId === socketId);

  useEffect(() => {
    if (!ready) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setSocketId(socket.id);
    };

    socket.on("connect", handleConnect);
    if (socket.connected) {
      setSocketId(socket.id);
    }

    socket.emit("join-room", { roomId, name });

    const handleUsersUpdate = (payload: RoomUser[]) => {
      if (Array.isArray(payload)) {
        setUsers(payload);
      }
    };

    const handleProgressUpdate = (payload: RoomUser[]) => {
      if (Array.isArray(payload)) {
        setUsers(payload);
      }
    };

    const handleTestStarted = (payload: { text?: string; users?: RoomUser[] }) => {
      setText(
        payload.text && payload.text.length > 0 ? payload.text : defaultText
      );
      setTyped("");
      if (Array.isArray(payload.users)) {
        setUsers(payload.users);
      }
      setTimeLeft(60);
      setIsRunning(true);
      setTestEnded(false);
    };

    socket.on("room-users-update", handleUsersUpdate);
    socket.on("progress-update", handleProgressUpdate);
    socket.on("test-started", handleTestStarted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("room-users-update", handleUsersUpdate);
      socket.off("progress-update", handleProgressUpdate);
      socket.off("test-started", handleTestStarted);
      socket.disconnect();
    };
  }, [ready, roomId, name]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setTestEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!ready) return;

    const progress = text.length
      ? Math.min(100, Math.round((typed.length / text.length) * 100))
      : 0;

    socket.emit("user-typing", { roomId, progress });
  }, [typed, text, roomId, ready]);

  useEffect(() => {
    if (!ready) return;
    inputRef.current?.focus();
  }, [ready]);

  function startTest() {
    if (!ready) return;
    if (!isHost) return;
    socket.emit("start-test", { roomId, text: defaultText });
    inputRef.current?.focus();
    setTimeLeft(60);
    setIsRunning(true);
    setTestEnded(false);
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-4 text-center">
          <h1 className="text-3xl font-bold">Missing room details</h1>
          <p className="text-zinc-400">
            Open multiplayer from the lobby so your name and room code are set.
          </p>
          <button
            onClick={() => router.push("/multiplayer")}
            className="px-4 py-2 rounded bg-emerald-500 text-emerald-950 font-semibold"
          >
            Back to multiplayer
          </button>
        </div>
      </main>
    );
  }

  if (testEnded) {
    return (
      <ScorePage
        name={name}
        roomId={roomId}
        typed={typed}
        text={text}
        onRestart={startTest}
        onExit={() => router.push("/multiplayer")}
        isHost={isHost}
      />
    );
  }

  if (!isRunning) {
    return (
      <WaitingRoomPage
        roomId={roomId}
        name={name}
        users={users}
        hostId={hostId}
        isHost={isHost}
        onStart={startTest}
        onExit={() => router.push("/multiplayer")}
      />
    );
  }

  return (
    <main
      className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Room {roomId}</h1>
            <p className="text-zinc-400">Playing as {name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              Time:{" "}
              <span className="text-zinc-100 font-semibold">
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Players</h2>
          {users.length === 0 ? (
            <p className="text-zinc-500">Waiting for players...</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-28 truncate text-sm text-zinc-300">
                    {user.name}
                  </div>
                  <div className="h-2 flex-1 bg-zinc-800 rounded">
                    <div
                      className="h-2 bg-emerald-400 rounded"
                      style={{ width: `${user.progress}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs text-zinc-400">
                    {user.progress}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 text-2xl font-mono leading-relaxed mx-auto tracking-wide select-none">
          {text.split("").map((char, i) => {
            const typedChar = typed[i];

            let color = "text-zinc-500";
            if (typedChar === undefined) color = "text-zinc-500";
            else if (typedChar === char) color = "text-emerald-400";
            else color = "text-red-400";

            const showCaret = i === typed.length;

            return (
              <span key={i} className="relative">
                {showCaret && (
                  <span className="absolute -left-0.5 top-0 h-full w-[2px] bg-emerald-400 animate-pulse" />
                )}
                <span className={cn(color)}>{char}</span>
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value.slice(0, text.length))}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          spellCheck={false}
        />

        <p className="text-center text-zinc-500">
          Click anywhere and start typing
        </p>
      </div>
    </main>
  );
}
