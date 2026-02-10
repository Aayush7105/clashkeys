"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const SoloTypingArea: React.FC = () => {
  const text = "This is a simple solo typing test for the pro.";
  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Detect tab change
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
    <div className="relative w-full max-w-5xl mx-auto">
      {/* 1. TEXT CONTAINER - Only this part blurs */}
      <div
        className={`relative transition-all duration-500 ease-in-out
        ${!isFocused ? "blur-[6px] opacity-20 scale-[0.99]" : "blur-0 opacity-100 scale-100"}`}
      >
        <div className="relative whitespace-pre-wrap break-all text-2xl md:text-3xl lg:text-4xl font-mono leading-[1.6] tracking-tight text-left select-none">
          <div
            ref={caretRef}
            className="absolute h-[1.2em] w-0.5 bg-yellow-400 rounded-full transition-all duration-100 ease-out z-10 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            style={{ marginTop: "0.2em" }}
          />

          {text.split("").map((char, i) => {
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
              charRefs.current[text.length] = el;
            }}
            className="inline-block w-0"
          />
        </div>
      </div>

      {/* 2. THE GLOBAL OVERLAY */}
      {!isFocused && (
        <div
          onClick={() => inputRef.current?.focus()}
          /* 
             z-index is high (40), but make sure your Navbar is z-50+. 
             We removed backdrop-blur from here so the navbar stays clean.
          */
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-neutral-800/80 border border-neutral-700 shadow-2xl transition-all">
              <span className="text-yellow-400 animate-pulse">▶</span>
              <span className="text-neutral-200 font-mono text-lg tracking-widest uppercase">
                Click to Resume
              </span>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={typed}
        onChange={(e) => setTyped(e.target.value.slice(0, text.length))}
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
