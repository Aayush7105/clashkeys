"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import MultiplayerNavbar from "./multiplayer-navbar";
import MultiplayerScorePage from "./multiplayer-score-page";
import MultiplayerTypingArea from "./multiplayer-typing-area";
import MultiplayerWaitingRoom from "./multiplayer-waiting-room";
import {
  DEFAULT_MULTIPLAYER_DURATION,
  getRandomMultiplayerText,
  isValidMultiplayerDuration,
} from "./multiplayer-constants";
import type { RoomUser, TestStartedPayload } from "./multiplayer-types";
export const dynamic = "force-dynamic";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeUser(user: Partial<RoomUser>): RoomUser {
  return {
    id: user.id ?? "",
    name: user.name ?? "Player",
    progress:
      typeof user.progress === "number" && Number.isFinite(user.progress)
        ? user.progress
        : 0,
    correctChars:
      typeof user.correctChars === "number" && Number.isFinite(user.correctChars)
        ? user.correctChars
        : 0,
    totalKeystrokes:
      typeof user.totalKeystrokes === "number" &&
      Number.isFinite(user.totalKeystrokes)
        ? user.totalKeystrokes
        : 0,
  };
}

export default function MultiplayerArea() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const roomId = searchParams.get("roomId") ?? "";
  const rawName = searchParams.get("name") ?? "";
  const name = useMemo(() => safeDecode(rawName), [rawName]);
  const rawDuration = Number(searchParams.get("duration"));
  const initialDuration = isValidMultiplayerDuration(rawDuration)
    ? rawDuration
    : DEFAULT_MULTIPLAYER_DURATION;

  const [users, setUsers] = useState<RoomUser[]>([]);
  const [text, setText] = useState(getRandomMultiplayerText());
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const selectedDurationRef = useRef(initialDuration);
  const [roundDuration, setRoundDuration] = useState(initialDuration);
  const [roundStartedAt, setRoundStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isRunning, setIsRunning] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [rawWpmHistory, setRawWpmHistory] = useState<number[]>([]);
  const [errorDotHistory, setErrorDotHistory] = useState<(number | null)[]>([]);
  const lastSampleSecondRef = useRef(-1);
  const lastIncorrectCountRef = useRef(0);

  const ready = roomId.trim().length > 0 && name.trim().length > 0;
  const hostId = users[0]?.id ?? null;
  const isHost = Boolean(hostId && socketId && hostId === socketId);

  useEffect(() => {
    selectedDurationRef.current = selectedDuration;
  }, [selectedDuration]);

  const elapsedMs =
    roundStartedAt === null
      ? 0
      : Math.max(
          0,
          Math.min(
            (finishedAt ?? now) - roundStartedAt,
            Math.max(1, roundDuration) * 1000,
          ),
        );
  const elapsedSeconds = Math.round(elapsedMs / 1000);
  const elapsedFloor = Math.floor(elapsedMs / 1000);
  const timeLeft =
    roundStartedAt === null
      ? roundDuration
      : Math.max(0, roundDuration - elapsedFloor);

  useEffect(() => {
    if (!ready) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setSocketId(socket.id ?? null);
    };

    socket.on("connect", handleConnect);
    if (socket.connected) {
      handleConnect();
    }

    socket.emit("join-room", { roomId, name });

    const handleUsersUpdate = (payload: RoomUser[]) => {
      if (Array.isArray(payload)) {
        setUsers(payload.map((user) => normalizeUser(user)));
      }
    };

    const handleProgressUpdate = (payload: RoomUser[]) => {
      if (Array.isArray(payload)) {
        setUsers(payload.map((user) => normalizeUser(user)));
      }
    };

    const handleTestStarted = (payload: TestStartedPayload) => {
      const incomingDuration = Number(payload.duration);
      const nextDuration = isValidMultiplayerDuration(incomingDuration)
        ? incomingDuration
        : selectedDurationRef.current;
      const startedAt =
        typeof payload.startedAt === "number" &&
        Number.isFinite(payload.startedAt)
          ? payload.startedAt
          : Date.now();

      setText(
        typeof payload.text === "string" && payload.text.trim().length > 0
          ? payload.text
          : getRandomMultiplayerText(),
      );
      setTyped("");
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setWpmHistory([]);
      setRawWpmHistory([]);
      setErrorDotHistory([]);
      lastSampleSecondRef.current = -1;
      lastIncorrectCountRef.current = 0;
      setRoundDuration(nextDuration);
      setRoundStartedAt(startedAt);
      setFinishedAt(null);
      setNow(Date.now());
      setIsFocused(true);
      if (Array.isArray(payload.users)) {
        setUsers(payload.users.map((user) => normalizeUser(user)));
      }
      setIsRunning(true);
      setTestEnded(false);
      setTimeout(() => inputRef.current?.focus(), 0);
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
    if (!isRunning || roundStartedAt === null) return;

    const timerId = setInterval(() => {
      const current = Date.now();
      setNow(current);

      const elapsed = current - roundStartedAt;
      if (elapsed >= roundDuration * 1000) {
        setFinishedAt(roundStartedAt + roundDuration * 1000);
        setIsRunning(false);
        setTestEnded(true);
        return;
      }

      const elapsedSec = Math.floor(elapsed / 1000);
      if (elapsedSec > lastSampleSecondRef.current) {
        lastSampleSecondRef.current = elapsedSec;
        const minutes = elapsed / 60000;
        const liveWpm = minutes > 0 ? correctKeystrokes / 5 / minutes : 0;
        const liveRawWpm = minutes > 0 ? totalKeystrokes / 5 / minutes : 0;
        const incorrectChars = Math.max(0, totalKeystrokes - correctKeystrokes);
        const hasNewErrors = incorrectChars > lastIncorrectCountRef.current;
        lastIncorrectCountRef.current = incorrectChars;
        setWpmHistory((history) => [...history, liveWpm]);
        setRawWpmHistory((history) => [...history, liveRawWpm]);
        setErrorDotHistory((history) => [
          ...history,
          hasNewErrors ? liveWpm : null,
        ]);
      }
    }, 100);

    return () => clearInterval(timerId);
  }, [
    isRunning,
    roundStartedAt,
    roundDuration,
    correctKeystrokes,
    totalKeystrokes,
  ]);

  useEffect(() => {
    if (!ready) return;

    const progress = text.length
      ? Math.min(100, Math.round((typed.length / text.length) * 100))
      : 0;

    socket.emit("user-typing", {
      roomId,
      progress,
      correctChars: correctKeystrokes,
      totalKeystrokes,
    });
  }, [typed, text, roomId, ready, correctKeystrokes, totalKeystrokes]);

  useEffect(() => {
    if (!ready || !isRunning) return;
    inputRef.current?.focus();
  }, [ready, isRunning]);

  function onDurationChange(nextDuration: number) {
    if (!isHost || !isValidMultiplayerDuration(nextDuration)) return;
    if (nextDuration === selectedDuration) return;

    setSelectedDuration(nextDuration);
    setRoundDuration(nextDuration);
    selectedDurationRef.current = nextDuration;

    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", String(nextDuration));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function startTest() {
    if (!ready || !isHost) return;

    const nextText = getRandomMultiplayerText();
    socket.emit("start-test", {
      roomId,
      text: nextText,
      duration: selectedDuration,
    });
  }

  function handleTypedChange(next: string) {
    if (!isRunning || testEnded) return;

    const value = next.slice(0, text.length);

    if (value.length > typed.length) {
      const added = value.slice(typed.length);
      let correctAdded = 0;

      added.split("").forEach((char, index) => {
        if (char === text[typed.length + index]) {
          correctAdded += 1;
        }
      });

      setTotalKeystrokes((count) => count + added.length);
      setCorrectKeystrokes((count) => count + correctAdded);
    }

    setTyped(value);

    if (value.length === text.length) {
      const finishedNow = Date.now();
      setFinishedAt(finishedNow);
      setNow(finishedNow);
      setIsRunning(false);
      setTestEnded(true);
    }
  }

  function handleKeyDown() {
    if (!isRunning || testEnded) return;
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    if (!isRunning || testEnded) {
      event.preventDefault();
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-4 text-center">
          <h1 className="text-3xl font-bold font-mono">Missing room details</h1>
          <p className="text-neutral-400 font-mono">
            Open multiplayer from the lobby so your name and room code are set.
          </p>
          <button
            onClick={() => router.push("/multiplayer")}
            className="px-4 py-2 rounded-xl bg-[#e2b714] text-neutral-900 font-semibold font-mono cursor-pointer"
            type="button"
          >
            Back to multiplayer
          </button>
        </div>
      </main>
    );
  }

  if (testEnded) {
    return (
      <MultiplayerScorePage
        roomId={roomId}
        elapsedSeconds={elapsedSeconds}
        totalKeystrokes={totalKeystrokes}
        correctKeystrokes={correctKeystrokes}
        wpmHistory={wpmHistory}
        rawWpmHistory={rawWpmHistory}
        errorDotHistory={errorDotHistory}
        isHost={isHost}
        onRestart={startTest}
        onExit={() => router.push("/multiplayer")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 flex items-start justify-center px-2 py-16">
      <div className="max-w-7xl w-full">
        <MultiplayerNavbar
          currentDuration={selectedDuration}
          onDurationChange={onDurationChange}
          isHost={isHost}
        />

        {!isRunning ? (
          <MultiplayerWaitingRoom
            roomId={roomId}
            name={name}
            users={users}
            hostId={hostId}
            isHost={isHost}
            selectedDuration={selectedDuration}
            onStart={startTest}
            onExit={() => router.push("/multiplayer")}
          />
        ) : (
          <MultiplayerTypingArea
            roomId={roomId}
            name={name}
            text={text}
            typed={typed}
            users={users}
            timeLeft={timeLeft}
            isFocused={isFocused}
            inputRef={inputRef}
            onTypedChange={handleTypedChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocusChange={setIsFocused}
          />
        )}
      </div>
    </main>
  );
}
