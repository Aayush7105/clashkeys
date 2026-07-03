"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type MultiplayerTypingAreaProps = {
  roomId: string;
  name: string;
  text: string;
  typed: string;
  timeLeft: number;
  isFocused: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onTypedChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFocusChange: (focused: boolean) => void;
  showUI?: boolean;
};

export default function MultiplayerTypingArea({
  roomId,
  name,
  text,
  typed,
  timeLeft,
  isFocused,
  inputRef,
  onTypedChange,
  onKeyDown,
  onPaste,
  onFocusChange,
  showUI = true,
}: MultiplayerTypingAreaProps) {
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

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
  }, [inputRef]);

  const keepActiveCharInView = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const activeChar = charRefs.current[Math.min(typed.length, text.length)];
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
  }, [typed.length, text.length]);

  useLayoutEffect(() => {
    const target = charRefs.current[typed.length];
    const caret = caretRef.current;

    if (!target || !caret) return;

    caret.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
  }, [typed, text]);

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

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto transition-all duration-500 ${showUI ? "mt-2" : "mt-0"}`}
      onClick={focusInput}
    >
      <div className={`flex flex-wrap items-center justify-between gap-2 transition-all duration-500 ease-in-out overflow-hidden ${
        showUI
          ? "opacity-100 translate-y-0 pointer-events-auto max-h-24 mb-4 md:mb-8"
          : "opacity-0 -translate-y-2 pointer-events-none max-h-0 mb-0"
      }`}>
        <div>
          <h1 className="text-xl font-semibold font-mono text-neutral-200 md:text-3xl">
            Room {roomId}
          </h1>
          <p className="text-xs text-neutral-500 tracking-tight font-mono md:text-[16px]">Playing as {name}</p>
        </div>
      </div>

      <div
        className={`relative transition-all duration-500 ease-in-out ${!isFocused ? "blur-[6px] opacity-20 scale-[0.98]" : "blur-0 opacity-100 scale-100"
          }`}
      >
        <div
          className="relative whitespace-pre-wrap text-2xl md:text-3xl lg:text-4xl font-mono leading-[1.6] tracking-tight text-left select-none"
          suppressHydrationWarning={true}
        >
          <div
            ref={caretRef}
            className="absolute h-[1.2em] w-0.5 bg-yellow-400 rounded-full transition-all duration-100 ease-out z-10 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            style={{ marginTop: "0.2em" }}
          />

          <div className="inline">
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
                  className={cn(colorClass, "transition-colors duration-150")}
                >
                  {char}
                </span>
              );
            })}
            <span
              ref={(el) => {
                charRefs.current[text.length] = el;
              }}
              className="inline-block w-0 h-[1em]"
            />
          </div>
        </div>
      </div>

      {!isFocused && (
        <div
          onClick={focusInput}
          className="fixed inset-0 z-40 flex flex-col gap-10 items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="px-6 py-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-200 font-mono text-lg uppercase tracking-widest">
            Click to Resume
          </div>
        </div>
      )}

      <textarea
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={(event) => onTypedChange(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        className="fixed left-0 top-0 h-px w-px opacity-0 pointer-events-none"
        autoComplete="off"
        spellCheck={false}
        rows={1}
      />
    </div>
  );
}
