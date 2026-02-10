"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";

const TEXT_POOL = [
  "The quick brown fox jumps over the lazy dog.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Programming is the art of telling another human what he wants the computer to do.",
  "In the middle of every difficulty lies opportunity.",
  "Move fast and break things. Unless you are breaking things, you are not moving fast enough.",
  "The only way to do great work is to love what you do.",
  "Focus is a matter of deciding what things you are not going to do.",
  "Your time is limited, so don't waste it living someone else's life.",
];

interface SoloTypingAreaProps {
  duration: number;
}

const SoloTypingArea: React.FC<SoloTypingAreaProps> = ({ duration }) => {
  // 1. Initialize state directly.
  // We use a fallback for SSR and suppress the hydration warning below.
  const [targetText] = useState(() => {
    // If we're on the server, pick the first one.
    // If on client, pick a random one.
    if (typeof window === "undefined") return TEXT_POOL[0];
    return TEXT_POOL[Math.floor(Math.random() * TEXT_POOL.length)];
  });

  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);

  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const correctChars = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === targetText[i]) count++;
    }
    return count;
  }, [typed, targetText]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !endTime && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setEndTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, endTime, timeLeft]);

  const timeElapsed = duration - timeLeft;
  const timeMinutes = timeElapsed / 60;
  const accuracy =
    typed.length === 0 ? 100 : (correctChars / typed.length) * 100;
  const wpm = timeMinutes > 0 ? correctChars / 5 / timeMinutes : 0;

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

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10">
      <div className="mb-4 text-2xl font-mono text-yellow-500">{timeLeft}s</div>

      <div
        className={`relative transition-all duration-500 ease-in-out
        ${!isFocused || endTime ? "blur-[6px] opacity-20 scale-[0.98]" : "blur-0 opacity-100 scale-100"}`}
      >
        <div
          className="relative text-2xl md:text-3xl lg:text-4xl font-mono leading-[1.6] tracking-tight text-left select-none"
          // 2. THIS IS THE KEY: Suppress the mismatch warning for this specific text block
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

      {endTime && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900/80 rounded-xl border border-neutral-700 shadow-2xl">
          <div className="flex gap-10 mb-6 text-center">
            <div>
              <p className="text-xs uppercase text-neutral-500 font-mono">
                wpm
              </p>
              <p className="text-5xl text-yellow-400 font-bold">
                {wpm.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500 font-mono">
                acc
              </p>
              <p className="text-5xl text-neutral-200 font-bold">
                {accuracy.toFixed(0)}%
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-neutral-800 text-neutral-200 rounded font-mono hover:bg-neutral-700 transition uppercase tracking-widest text-xs border border-neutral-600"
          >
            Restart
          </button>
        </div>
      )}

      {!isFocused && !endTime && (
        <div
          onClick={() => inputRef.current?.focus()}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="px-6 py-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest animate-pulse">
            Click to Resume
          </div>
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
