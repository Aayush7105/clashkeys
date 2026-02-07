"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function SoloPlayPage() {
  const text = "This is a simple solo typing test for the pro.";
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main
      className="min-h-screen bg-[#1a1b1f] text-[#e2e2e2] flex items-center justify-center px-6"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-6xl w-full space-y-10">
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a]">
          <span>Solo Play</span>
          <span className="text-[#e2b714]">clashkeys</span>
        </div>

        <div className="w-full max-w-6xl text-3xl sm:text-4xl font-mono leading-relaxed tracking-wide select-none">
          {text.split("").map((char, i) => {
            const typedChar = typed[i];

            let color = "text-[#4a4f5a]";
            if (typedChar === undefined) color = "text-[#4a4f5a]";
            else if (typedChar === char) color = "text-[#e2e2e2]";
            else color = "text-[#e34f4f]";

            const showCaret = i === typed.length;

            return (
              <span key={i} className="relative">
                {showCaret && (
                  <span className="absolute -left-0.5 top-0 h-full w-[2px] bg-[#e2b714] animate-pulse" />
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
      </div>
    </main>
  );
}
