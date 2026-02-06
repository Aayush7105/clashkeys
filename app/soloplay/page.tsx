"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function SoloPlay() {
  const text = "This is a simple solo typing test for the prototype.";
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus typing
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main
      className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 "
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-3xl w-full space-y-8">
        {/* Title */}
        <h1 className="text-center text-4xl font-bold">Solo Typing</h1>

        {/* Text Output */}
        <div className="w-7xl rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 text-2xl font-mono leading-relaxed mx-auto tracking-wide select-none">
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

        {/* Hidden Input */}
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value.slice(0, text.length))}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Hint */}
        <p className="text-center text-zinc-500">
          Click anywhere and start typing
        </p>
      </div>
    </main>
  );
}
