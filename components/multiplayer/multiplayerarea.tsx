"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import GameNavbar from "@/components/game-navbar";
import MultiplayerScorePage from "./multiplayer-score-page";
import MultiplayerTypingArea from "./multiplayer-typing-area";
import MultiplayerWaitingRoom from "./multiplayer-waiting-room";
import {
  DEFAULT_MULTIPLAYER_DURATION,
  MULTIPLAYER_DURATIONS,
  getRandomMultiplayerText,
  isValidMultiplayerDuration,
} from "./multiplayer-constants";
import type { RoomUser, TestStartedPayload } from "./multiplayer-types";
export const dynamic = "force-dynamic";

type MultiplayerAreaProps = {
  initialRoomId?: string;
  initialName?: string;
  initialDuration?: string;
};

type ErrorPoint = {
  second: number;
  wpm: number;
};

function countCorrectChars(typedText: string, sourceText: string) {
  let count = 0;
  for (let i = 0; i < typedText.length; i += 1) {
    if (typedText[i] === sourceText[i]) {
      count += 1;
    }
  }
  return count;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fetchWithTimeout(url: string, ms = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  return fetch(url, {
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

function cleanText(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitWords(text: string, maxWords: number) {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

async function getMultiplayerSentence(): Promise<string> {
  async function fetchWiki() {
    const response = await fetchWithTimeout(
      "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      2000,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch multiplayer text");
    }

    const data = await response.json();
    const extract = data?.extract;

    if (typeof extract !== "string") {
      throw new Error("Missing extract text");
    }

    const cleaned = cleanText(extract);
    if (!cleaned) {
      throw new Error("Extract cleaned to empty text");
    }

    const limited = limitWords(cleaned, 40);
    if (limited.split(/\s+/).length < 15) {
      throw new Error("Text too short");
    }

    return limited;
  }

  try {
    return await fetchWiki();
  } catch {
    try {
      return await fetchWiki();
    } catch {
      return getRandomMultiplayerText();
    }
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
      typeof user.correctChars === "number" &&
      Number.isFinite(user.correctChars)
        ? user.correctChars
        : 0,
    totalKeystrokes:
      typeof user.totalKeystrokes === "number" &&
      Number.isFinite(user.totalKeystrokes)
        ? user.totalKeystrokes
        : 0,
  };
}

export default function MultiplayerArea({
  initialRoomId = "",
  initialName = "",
  initialDuration: initialDurationParam = "",
}: MultiplayerAreaProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const roomId = searchParams.get("roomId") ?? initialRoomId;
  const rawName = searchParams.get("name") ?? initialName;
  const name = useMemo(() => safeDecode(rawName), [rawName]);
  const rawDuration = Number(
    searchParams.get("duration") ?? initialDurationParam,
  );
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
  const [burstWpmHistory, setBurstWpmHistory] = useState<number[]>([]);
  const [errorPoints, setErrorPoints] = useState<ErrorPoint[]>([]);
  const lastSampleSecondRef = useRef(-1);
  const keystrokeTimesRef = useRef<number[]>([]);
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);

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
      totalKeystrokesRef.current = 0;
      correctKeystrokesRef.current = 0;
      setWpmHistory([]);
      setRawWpmHistory([]);
      setBurstWpmHistory([]);
      setErrorPoints([]);
      lastSampleSecondRef.current = -1;
      keystrokeTimesRef.current = [];
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
        const liveRawWpm =
          minutes > 0 ? totalKeystrokesRef.current / 5 / minutes : 0;
        const liveWpm =
          minutes > 0 ? correctKeystrokesRef.current / 5 / minutes : 0;
        const burstWindowStart = current - 1000;
        keystrokeTimesRef.current = keystrokeTimesRef.current.filter(
          (timestamp) => timestamp > burstWindowStart,
        );
        const burstWpm = keystrokeTimesRef.current.length * 12;
        setWpmHistory((history) => [...history, liveWpm]);
        setRawWpmHistory((history) => [...history, liveRawWpm]);
        setBurstWpmHistory((history) => [...history, burstWpm]);
      }
    }, 100);

    return () => clearInterval(timerId);
  }, [isRunning, roundStartedAt, roundDuration]);

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

    void (async () => {
      const nextText = await getMultiplayerSentence();
      socket.emit("start-test", {
        roomId,
        text: nextText,
        duration: selectedDuration,
      });
    })();
  }

  function handleTypedChange(next: string) {
    if (!isRunning || testEnded) return;

    const value = next.slice(0, text.length);
    const eventTime = Date.now();
    const keystrokeDelta = Math.abs(value.length - typed.length);
    const nextCorrectChars = countCorrectChars(value, text);

    if (keystrokeDelta > 0) {
      setTotalKeystrokes((count) => {
        const nextCount = count + keystrokeDelta;
        totalKeystrokesRef.current = nextCount;
        return nextCount;
      });
      for (let i = 0; i < keystrokeDelta; i += 1) {
        keystrokeTimesRef.current.push(eventTime);
      }
    }

    if (value.length > typed.length) {
      const added = value.slice(typed.length);
      const elapsedForPointMs =
        roundStartedAt === null
          ? 0
          : Math.max(
              0,
              Math.min(eventTime - roundStartedAt, roundDuration * 1000),
            );
      const pointSecond = elapsedForPointMs / 1000;
      const minutes = elapsedForPointMs / 60000;
      let projectedCorrect = countCorrectChars(typed, text);
      const newErrorPoints: ErrorPoint[] = [];

      added.split("").forEach((char, index) => {
        if (char === text[typed.length + index]) {
          projectedCorrect += 1;
        } else {
          const pointWpm = minutes > 0 ? projectedCorrect / 5 / minutes : 0;
          newErrorPoints.push({ second: pointSecond, wpm: pointWpm });
        }
      });

      if (newErrorPoints.length > 0) {
        setErrorPoints((points) => [...points, ...newErrorPoints]);
      }
    }

    setCorrectKeystrokes(() => {
      correctKeystrokesRef.current = nextCorrectChars;
      return nextCorrectChars;
    });
    setTyped(value);

    if (value.length === text.length) {
      const finishedNow = eventTime;
      setFinishedAt(finishedNow);
      setNow(finishedNow);
      setIsRunning(false);
      setTestEnded(true);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isRunning || testEnded) return;
    // Keystrokes are counted from onChange deltas to avoid focus/key-event edge cases.
    void event;
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
        elapsedMs={elapsedMs}
        selectedDuration={roundDuration}
        totalKeystrokes={totalKeystrokes}
        correctKeystrokes={correctKeystrokes}
        wpmHistory={wpmHistory}
        rawWpmHistory={rawWpmHistory}
        burstWpmHistory={burstWpmHistory}
        errorPoints={errorPoints}
        users={users}
        currentUserId={socketId}
        isHost={isHost}
        onRestart={startTest}
        onExit={() => router.push("/multiplayer")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 flex items-start justify-center px-3 pt-3 md:items-center md:px-2 md:py-16">
      <div className="w-full max-w-7xl min-h-screen py-0 md:py-20">
        <div className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur md:relative md:top-auto md:bg-transparent md:backdrop-blur-none">
          <GameNavbar
            currentDuration={selectedDuration}
            durations={MULTIPLAYER_DURATIONS}
            onDurationChange={onDurationChange}
            canChangeDuration={isHost}
            disabledDurationTitle="Host controls duration"
          />
        </div>
        <div className="mt-10 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[#6b6f7a] md:px-16 lg:px-32">
          <span className="font-mono text-md">Multiplayer</span>
        </div>

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
