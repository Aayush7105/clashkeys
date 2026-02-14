"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import SoloScorePage from "./soloscorepage";
import { SOLO_TEXT_POOL } from "./text-pool";

interface SoloTypingAreaProps {
  duration: number;
  initialText: string;
}

const SoloTypingArea: React.FC<SoloTypingAreaProps> = ({
  duration,
  initialText,
}) => {
  const sanitizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const targetText = sanitizeText(initialText || SOLO_TEXT_POOL[0]);

  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // ✅ real accuracy counters
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);
  const lastSampleSecondRef = useRef<number>(-1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (startTime === null || endTime !== null) return;

    lastSampleSecondRef.current = -1;
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
        const currentWpm = minutes > 0 ? correctKeystrokes / 5 / minutes : 0;
        setWpmHistory((h) => [...h, currentWpm]);
      }
    }, 100);

    return () => clearInterval(id);
  }, [startTime, endTime, duration, correctKeystrokes]);

  const elapsedMs =
    startTime === null ? 0 : Math.max(0, (endTime ?? now) - startTime);
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const timeElapsed = Math.round(elapsedMs / 1000);
  const timeMinutes = elapsedMs / 60000;
  const timeLeft =
    startTime === null ? duration : Math.max(0, duration - elapsedSec);

  // ✅ real accuracy
  const accuracy =
    totalKeystrokes === 0 ? 100 : (correctKeystrokes / totalKeystrokes) * 100;

  const wpm = timeMinutes > 0 ? correctKeystrokes / 5 / timeMinutes : 0;
  const rawWpm = timeMinutes > 0 ? totalKeystrokes / 5 / timeMinutes : 0;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") setIsFocused(false);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useLayoutEffect(() => {
    const el = charRefs.current[typed.length];
    const caret = caretRef.current;
    if (!el || !caret) return;
    caret.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
  }, [typed]);

  if (endTime) {
    function handleRestart(): void {
      throw new Error("Function not implemented.");
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
        wpmHistory={wpmHistory}
      />
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 ">
      <div className="mb-4 text-2xl font-mono text-yellow-500">{timeLeft}s</div>

      <div
        className={`relative transition-all duration-500 ease-in-out
          ${
            !isFocused || endTime
              ? "blur-[6px] opacity-20 scale-[0.98]"
              : "blur-0 opacity-100 scale-100"
          }`}
      >
        <div
          className="relative text-2xl md:text-3xl lg:text-4xl font-mono leading-[1.6] tracking-tight text-left select-none"
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
          onClick={() => inputRef.current?.focus()}
          className="fixed inset-0 z-40 flex flex-col gap-10 items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="px-6 py-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest">
            Click to Resume
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 mx-auto rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest "
          >
            Restart
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={typed}
        onChange={(e) => {
          if (endTime) return;

          const val = e.target.value.slice(0, targetText.length);

          // ✅ count only real typed characters (ignore backspace)
          if (val.length > typed.length) {
            const newChar = val[val.length - 1];
            const expectedChar = targetText[typed.length];

            setTotalKeystrokes((p) => p + 1);

            if (newChar === expectedChar) {
              setCorrectKeystrokes((p) => p + 1);
            }
          }

          if (!startTime && val.length === 1) setStartTime(Date.now());
          if (val.length === targetText.length) setEndTime(Date.now());

          setTyped(val);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="fixed opacity-0 pointer-events-none"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
};

export default SoloTypingArea;
