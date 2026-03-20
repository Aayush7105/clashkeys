"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { primeRealtimeConnection, socket } from "@/lib/socket";
import GameNavbar from "@/components/game-navbar";
import MultiplayerScorePage from "./multiplayer-score-page";
import MultiplayerTypingArea from "./multiplayer-typing-area";
import MultiplayerWaitingRoom from "./multiplayer-waiting-room";
import {
  DEFAULT_MULTIPLAYER_DURATION,
  DEFAULT_MULTIPLAYER_MODE,
  MULTIPLAYER_DURATIONS,
  getRandomMultiplayerText,
  isValidMultiplayerMode,
  isValidMultiplayerDuration,
} from "./multiplayer-constants";
import type {
  RoomSettingsPayload,
  RoomUser,
  TestStartedPayload,
} from "./multiplayer-types";
import type { SoloMode } from "../soloplay/soloplay-modes";
export const dynamic = "force-dynamic";

type MultiplayerAreaProps = {
  initialRoomId?: string;
  initialName?: string;
  initialDuration?: string;
  initialMode?: string;
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

function cleanTextForWords(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTextForQuote(text: string) {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^A-Za-z0-9\s.,?!:;'"()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitWords(text: string, maxWords: number) {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

async function getMultiplayerSentence(mode: SoloMode): Promise<string> {
  if (
    mode === "punctuation" ||
    mode === "numbers" ||
    mode === "code"
  ) {
    return getRandomMultiplayerText(mode);
  }

  if (mode === "quote") {
    try {
      const response = await fetchWithTimeout("https://api.quotable.io/random", 2500);
      if (!response.ok) {
        throw new Error("Failed to fetch quote text");
      }

      const data = await response.json();
      const content = typeof data?.content === "string" ? data.content : "";
      const author = typeof data?.author === "string" ? data.author : "";
      const combined = author ? `${content} - ${author}` : content;
      const cleaned = cleanTextForQuote(combined);

      if (!cleaned) {
        throw new Error("Quote cleaned to empty text");
      }

      const limited = limitWords(cleaned, 45);
      if (limited.split(/\s+/).length < 6) {
        throw new Error("Quote too short");
      }

      return limited;
    } catch {
      return getRandomMultiplayerText("quote");
    }
  }

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

    const cleaned = cleanTextForWords(extract);
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
      return getRandomMultiplayerText("words");
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
  initialMode: initialModeParam = "",
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
  const rawMode = searchParams.get("mode") ?? initialModeParam;
  const initialDuration = isValidMultiplayerDuration(rawDuration)
    ? rawDuration
    : DEFAULT_MULTIPLAYER_DURATION;
  const initialMode = isValidMultiplayerMode(rawMode)
    ? rawMode
    : DEFAULT_MULTIPLAYER_MODE;

  const [users, setUsers] = useState<RoomUser[]>([]);
  const [text, setText] = useState(getRandomMultiplayerText(initialMode));
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const selectedDurationRef = useRef(initialDuration);
  const [selectedMode, setSelectedMode] = useState<SoloMode>(initialMode);
  const selectedModeRef = useRef<SoloMode>(initialMode);
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
  const optimisticUserId = useMemo(
    () => `local:${roomId}:${name}`,
    [roomId, name],
  );
  const visibleUsers = useMemo(() => {
    if (!ready) return users;
    if (users.length > 0) return users;
    return [
      {
        id: socketId ?? optimisticUserId,
        name,
        progress: 0,
        correctChars: 0,
        totalKeystrokes: 0,
      },
    ];
  }, [ready, users, socketId, optimisticUserId, name]);
  const hostId = visibleUsers[0]?.id ?? null;
  const isHost = Boolean(hostId && socketId && hostId === socketId);

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const isMobileViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobileViewport) {
      input.focus();
      return;
    }

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }, []);

  useEffect(() => {
    selectedDurationRef.current = selectedDuration;
  }, [selectedDuration]);

  useEffect(() => {
    selectedModeRef.current = selectedMode;
  }, [selectedMode]);

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

    const handleRoomSettingsUpdate = (payload: RoomSettingsPayload) => {
      const incomingDuration = Number(payload?.duration);
      if (isValidMultiplayerDuration(incomingDuration)) {
        setSelectedDuration(incomingDuration);
        selectedDurationRef.current = incomingDuration;
      }

      if (isValidMultiplayerMode(payload?.mode)) {
        setSelectedMode(payload.mode);
        selectedModeRef.current = payload.mode;
      }
    };

    const handleTestStarted = (payload: TestStartedPayload) => {
      const incomingDuration = Number(payload.duration);
      const nextDuration = isValidMultiplayerDuration(incomingDuration)
        ? incomingDuration
        : selectedDurationRef.current;
      const nextMode = isValidMultiplayerMode(payload.mode)
        ? payload.mode
        : selectedModeRef.current;
      const startedAt =
        typeof payload.startedAt === "number" &&
        Number.isFinite(payload.startedAt)
          ? payload.startedAt
          : Date.now();

      setText(
        typeof payload.text === "string" && payload.text.trim().length > 0
          ? payload.text
          : getRandomMultiplayerText(nextMode),
      );
      setSelectedMode(nextMode);
      selectedModeRef.current = nextMode;
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
      setTimeout(() => focusInput(), 0);
    };

    const joinRoom = () => {
      socket.emit("join-room", { roomId, name });
    };

    const handleConnect = () => {
      const nextSocketId = socket.id ?? null;
      setSocketId(nextSocketId);
      joinRoom();
    };

    const handleDisconnect = () => {
      setSocketId(null);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room-users-update", handleUsersUpdate);
    socket.on("progress-update", handleProgressUpdate);
    socket.on("room-settings-update", handleRoomSettingsUpdate);
    socket.on("test-started", handleTestStarted);

    primeRealtimeConnection();
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room-users-update", handleUsersUpdate);
      socket.off("progress-update", handleProgressUpdate);
      socket.off("room-settings-update", handleRoomSettingsUpdate);
      socket.off("test-started", handleTestStarted);
    };
  }, [ready, roomId, name, focusInput]);

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
    focusInput();
  }, [ready, isRunning, focusInput]);

  function onDurationChange(nextDuration: number) {
    if (isRunning) return;
    if (!isHost || !isValidMultiplayerDuration(nextDuration)) return;
    if (nextDuration === selectedDuration) return;

    setSelectedDuration(nextDuration);
    setRoundDuration(nextDuration);
    selectedDurationRef.current = nextDuration;

    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", String(nextDuration));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    socket.emit("room-settings-update", {
      roomId,
      duration: nextDuration,
      mode: selectedModeRef.current,
    });
  }

  function onModeChange(nextMode: SoloMode) {
    if (isRunning) return;
    if (!isHost || !isValidMultiplayerMode(nextMode)) return;
    if (nextMode === selectedMode) return;

    setSelectedMode(nextMode);
    selectedModeRef.current = nextMode;

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", nextMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    socket.emit("room-settings-update", {
      roomId,
      duration: selectedDurationRef.current,
      mode: nextMode,
    });
  }

  function startTest() {
    if (!ready || !isHost) return;

    void (async () => {
      const mode = selectedModeRef.current;
      const nextText = await getMultiplayerSentence(mode);
      socket.emit("start-test", {
        roomId,
        text: nextText,
        duration: selectedDuration,
        mode,
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!isRunning || testEnded) return;

    if (selectedMode === "code" && event.key === "Tab") {
      event.preventDefault();
      handleTypedChange(`${typed}  `);
      return;
    }

    // Keystrokes are counted from onChange deltas to avoid focus/key-event edge cases.
    void event;
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
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
        users={visibleUsers}
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
            currentMode={selectedMode}
            onModeChange={onModeChange}
            canChangeMode={isHost}
            disabledModeTitle="Host controls mode"
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
            users={visibleUsers}
            hostId={hostId}
            isHost={isHost}
            selectedDuration={selectedDuration}
            selectedMode={selectedMode}
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
