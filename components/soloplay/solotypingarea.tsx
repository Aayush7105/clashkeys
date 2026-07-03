"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import SoloScorePage from "./soloscorepage";
import {
  CODE_TEXT_POOL,
  NUMBERS_TEXT_POOL,
  PUNCTUATION_TEXT_POOL,
  QUOTE_TEXT_POOL,
  WORDS_TEXT_POOL,
} from "./text-pool";
import type { SoloMode } from "./soloplay-modes";

interface SoloTypingAreaProps {
  duration: number;
  initialText: string;
  mode: SoloMode;
  onTypingStateChange?: (isActive: boolean) => void;
}

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

function sanitizeTextByMode(text: string, mode: SoloMode) {
  if (mode === "punctuation") {
    return text
      .toLowerCase()
      .replace(/[^a-z\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "numbers") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.,:%/-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "quote") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "code") {
    return text
      .replace(/\r\n?/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/[^A-Za-z0-9\n .,?!:;'"(){}\[\]<>_=+\-*/%`$&|]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd();
  }

  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFallbackTextByMode(mode: SoloMode) {
  const pool =
    mode === "punctuation"
      ? PUNCTUATION_TEXT_POOL
      : mode === "numbers"
        ? NUMBERS_TEXT_POOL
        : mode === "quote"
          ? QUOTE_TEXT_POOL
          : mode === "code"
            ? CODE_TEXT_POOL
        : WORDS_TEXT_POOL;
  if (Array.isArray(pool) && pool.length > 0) {
    return pool[0];
  }
  if (mode === "punctuation") {
    return "ready? type this line exactly; punctuation matters!";
  }
  if (mode === "numbers") {
    return "version 2.4.1 released at 09:30 with 25% faster load times";
  }
  if (mode === "quote") {
    return "the journey of a thousand miles begins with a single step";
  }
  if (mode === "code") {
    return `for (let i = 0; i < items.length; i++) {
  if (items[i] > 0) {
    total += items[i];
  }
}`;
  }
  return "the quick brown fox jumps over the lazy dog";
}

const SoloTypingArea: React.FC<SoloTypingAreaProps> = ({
  duration,
  initialText,
  mode,
  onTypingStateChange,
}) => {
  const targetText = sanitizeTextByMode(
    initialText || getFallbackTextByMode(mode),
    mode,
  );

  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [rawWpmHistory, setRawWpmHistory] = useState<number[]>([]);
  const [burstWpmHistory, setBurstWpmHistory] = useState<number[]>([]);
  const [errorPoints, setErrorPoints] = useState<ErrorPoint[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);
  const lastSampleSecondRef = useRef<number>(-1);
  const keystrokeTimesRef = useRef<number[]>([]);
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);

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

  const keepActiveCharInView = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const activeChar = charRefs.current[Math.min(typed.length, targetText.length)];
    if (!activeChar) return;

    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const safeTop = viewportTop + 88;
    const safeBottom = viewportTop + viewportHeight - 20;
    const rect = activeChar.getBoundingClientRect();

    if (rect.top < safeTop || rect.bottom > safeBottom) {
      activeChar.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });
    }
  }, [typed.length, targetText.length]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (startTime === null || endTime !== null) return;

    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);

      const elapsedMs = current - startTime;
      if (elapsedMs >= duration * 1000) {
        setEndTime(startTime + duration * 1000);
        return;
      }

      const elapsedSec = Math.floor(elapsedMs / 1000);
      if (elapsedSec > lastSampleSecondRef.current) {
        lastSampleSecondRef.current = elapsedSec;
        const minutes = elapsedMs / 60000;
        const currentRawWpm =
          minutes > 0 ? totalKeystrokesRef.current / 5 / minutes : 0;
        const currentWpm =
          minutes > 0 ? correctKeystrokesRef.current / 5 / minutes : 0;
        const burstWindowStart = current - 1000;
        keystrokeTimesRef.current = keystrokeTimesRef.current.filter(
          (timestamp) => timestamp > burstWindowStart,
        );
        const burstWpm = keystrokeTimesRef.current.length * 12;
        setWpmHistory((history) => [...history, currentWpm]);
        setRawWpmHistory((history) => [...history, currentRawWpm]);
        setBurstWpmHistory((history) => [...history, burstWpm]);
      }
    }, 100);

    return () => clearInterval(id);
  }, [startTime, endTime, duration]);

  const elapsedMs =
    startTime === null ? 0 : Math.max(0, (endTime ?? now) - startTime);
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const timeElapsed = Math.round(elapsedMs / 1000);
  const timeMinutes = elapsedMs / 60000;
  const timeLeft =
    startTime === null ? duration : Math.max(0, duration - elapsedSec);

  const accuracy = totalKeystrokes === 0 ? 100 : (correctKeystrokes / totalKeystrokes) * 100;

  const rawWpm = timeMinutes > 0 ? totalKeystrokes / 5 / timeMinutes : 0;
  const wpm = timeMinutes > 0 ? correctKeystrokes / 5 / timeMinutes : 0;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") setIsFocused(false);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const isActive = startTime !== null && endTime === null && isFocused;
    onTypingStateChange?.(isActive);
  }, [startTime, endTime, isFocused, onTypingStateChange]);

  useLayoutEffect(() => {
    const el = charRefs.current[typed.length];
    const caret = caretRef.current;
    if (!el || !caret) return;
    caret.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
  }, [typed]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const run = () => {
      window.requestAnimationFrame(keepActiveCharInView);
    };

    run();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", run);
    viewport?.addEventListener("scroll", run);

    return () => {
      viewport?.removeEventListener("resize", run);
      viewport?.removeEventListener("scroll", run);
    };
  }, [keepActiveCharInView]);

  const applyTypedUpdate = useCallback(
    (nextRawValue: string, eventTime = Date.now()) => {
      if (endTime) return;

      const value = nextRawValue.slice(0, targetText.length);
      if (value === typed) return;

      const keystrokeDelta = Math.abs(value.length - typed.length);
      const nextCorrectChars = countCorrectChars(value, targetText);

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
          startTime === null
            ? 0
            : Math.max(0, Math.min(eventTime - startTime, duration * 1000));
        const pointSecond = elapsedForPointMs / 1000;
        const minutes = elapsedForPointMs / 60000;
        let projectedCorrect = countCorrectChars(typed, targetText);
        const newErrorPoints: ErrorPoint[] = [];

        added.split("").forEach((char, index) => {
          if (char === targetText[typed.length + index]) {
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

      if (startTime === null && value.length === 1) {
        lastSampleSecondRef.current = -1;
        setStartTime(eventTime);
      }
      if (value.length === targetText.length) setEndTime(eventTime);

      setTyped(value);
    },
    [duration, endTime, startTime, targetText, typed],
  );

  if (endTime) {
    function handleRestart(): void {
      window.location.href = "/";
    }

    return (
      <SoloScorePage
        wpm={wpm}
        rawWpm={rawWpm}
        accuracy={accuracy}
        correctChars={correctKeystrokes}
        incorrectChars={totalKeystrokes - correctKeystrokes}
        totalChars={totalKeystrokes}
        timeElapsed={timeElapsed}
        onRestart={handleRestart}
        selectedDuration={duration}
        wpmHistory={wpmHistory}
        rawWpmHistory={rawWpmHistory}
        burstWpmHistory={burstWpmHistory}
        errorPoints={errorPoints}
      />
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-2 ">
      <div className="mb-4 text-2xl font-mono text-yellow-500"><span className="text-5xl font-medium">{timeLeft}s</span></div>

      <div
        className={`relative transition-all duration-500 ease-in-out
          ${
            !isFocused || endTime
              ? "blur-[6px] opacity-20 scale-[0.98]"
              : "blur-0 opacity-100 scale-100"
          }`}
      >
        <div
          className={`relative text-2xl md:text-3xl lg:text-4xl font-mono leading-[1.6] tracking-tight text-left select-none ${
            mode === "code" ? "whitespace-pre-wrap" : ""
          }`}
          suppressHydrationWarning={true}
        >
          <div
            ref={caretRef}
            className="absolute h-[1.2em] w-0.5 bg-yellow-400 rounded-full transition-all duration-100 ease-out z-10 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            style={{ marginTop: "0.2em" }}
          />

          <div className="inline">
            {targetText.split("").map((char, i) => {
              const typedChar = typed[i];
              let colorClass = "text-neutral-600";
              if (typedChar !== undefined) {
                colorClass =
                  typedChar === char
                    ? "text-neutral-200"
                    : "text-red-500 border-b-2 border-red-500/30";
              }
              return (
                <span
                  key={i}
                  ref={(el) => {
                    charRefs.current[i] = el;
                  }}
                  className={`${colorClass} transition-colors duration-150`}
                >
                  {char}
                </span>
              );
            })}
            <span
              ref={(el) => {
                charRefs.current[targetText.length] = el;
              }}
              className="inline-block w-0 h-[1em]"
            />
          </div>
        </div>
      </div>

      {!isFocused && !endTime && (
        <div
          onClick={focusInput}
          className="fixed inset-0 z-40 flex flex-col gap-10 items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="px-6 py-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest">
            Click to Resume
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 mx-auto rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest cursor-pointer"
          >
            Restart
          </button>
        </div>
      )}

      <textarea
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={(event) => {
          applyTypedUpdate(event.target.value);
        }}
        onKeyDown={(event) => {
          if (endTime) return;

          if (mode === "code" && event.key === "Tab") {
            event.preventDefault();
            applyTypedUpdate(`${typed}  `);
            return;
          }

          void event;
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="fixed left-0 top-0 h-px w-px opacity-0 pointer-events-none"
        autoComplete="off"
        spellCheck={false}
        rows={1}
      />
    </div>
  );
};

export default SoloTypingArea;
