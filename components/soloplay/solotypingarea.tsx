"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const SoloTypingArea: React.FC = () => {
  const text = "This is a simple solo typing test for the pro.";

  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  // start typing immediately
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // click anywhere on screen → focus
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      if (!target) return;

      // ignore interactive UI
      if (
        target.closest(
          "button, a, input, textarea, select, option, [data-no-typing-focus]",
        )
      ) {
        return;
      }

      inputRef.current?.focus();
    };

    window.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener("mousedown", handler);
    };
  }, []);

  useLayoutEffect(() => {
    const el = charRefs.current[typed.length];
    const caret = caretRef.current;

    if (!el || !caret) return;

    caret.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [typed]);

  return (
    <div className="relative max-w-7xl mt-5">
      {/* typing area */}
      <div
        className={`relative whitespace-pre text-3xl sm:text-4xl font-mono leading-relaxed tracking-wider select-none transition h-screen
        ${!isFocused ? "blur-[2px]" : ""}`}
      >
        {/* caret */}
        <div
          ref={caretRef}
          className="absolute top-[0.15em] h-[0.9em] w-1 bg-neutral-200 rounded-2xl
                     transition-transform duration-150 ease-out"
        />

        {text.split("").map((char, i) => {
          const typedChar = typed[i];

          let colorClass = "text-[#4a4f5a]";
          if (typedChar === undefined) colorClass = "text-[#4a4f5a]";
          else if (typedChar === char) colorClass = "text-[#e2e2e2]";
          else colorClass = "text-[#e34f4f]";

          return (
            <span
              key={i}
              ref={(el) => (charRefs.current[i] = el)}
              className={colorClass}
            >
              {char}
            </span>
          );
        })}

        <span
          ref={(el) => (charRefs.current[text.length] = el)}
          className="inline-block w-0"
        />
      </div>

      {/* overlay + hint */}
      {!isFocused && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl sm:text-base text-[#6b6f7a]">
          {typed.length === 0
            ? "Click anywhere to start typing"
            : "Click anywhere to continue"}
        </div>
      )}

      {/* hidden input */}
      <input
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={(e) => setTyped(e.target.value.slice(0, text.length))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute inset-0 opacity-0"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
};

export default SoloTypingArea;
