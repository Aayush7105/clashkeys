"use client";

import React, { useEffect } from "react";
import WpmGraph from "../soloplay/wpmgraph";

type MultiplayerScorePageProps = {
  roomId: string;
  elapsedSeconds: number;
  selectedDuration: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  wpmHistory: number[];
  rawWpmHistory: number[];
  errorDotHistory: (number | null)[];
  isHost: boolean;
  onRestart: () => void;
  onExit: () => void;
};

export default function MultiplayerScorePage({
  roomId,
  elapsedSeconds,
  selectedDuration,
  totalKeystrokes,
  correctKeystrokes,
  wpmHistory,
  rawWpmHistory,
  errorDotHistory,
  isHost,
  onRestart,
  onExit,
}: MultiplayerScorePageProps) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const safeSeconds = Math.max(1, elapsedSeconds);
  const timeMinutes = safeSeconds / 60;

  const accuracy =
    totalKeystrokes === 0 ? 100 : (correctKeystrokes / totalKeystrokes) * 100;
  const wpm = timeMinutes > 0 ? correctKeystrokes / 5 / timeMinutes : 0;
  const rawWpm = timeMinutes > 0 ? totalKeystrokes / 5 / timeMinutes : 0;
  const incorrectChars = Math.max(0, totalKeystrokes - correctKeystrokes);

  const accuracyColor =
    accuracy >= 95
      ? "text-[#7fae5a]"
      : accuracy >= 90
        ? "text-[#e2b714]"
        : "text-[#ca4754]";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#323437] text-[#d1d0c5]">
      <div className="mx-auto flex h-screen w-full max-w-7xl flex-col justify-center gap-3 px-3 py-3 font-mono md:gap-5 md:px-4 md:py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#646669]">
          test completed - room {roomId}
        </p>

        <section className="flex w-full flex-col gap-2 md:gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-4 md:gap-6 lg:w-[15%] lg:flex-col">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                wpm
              </div>
              <div className="text-4xl font-semibold leading-none text-[#e2b714] md:text-6xl">
                {Math.round(wpm)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                acc
              </div>
              <div
                className={`text-4xl font-semibold leading-none md:text-6xl ${accuracyColor}`}
              >
                {Math.round(accuracy)}%
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[85%]">
            <WpmGraph
              wpmData={wpmHistory}
              rawWpmData={rawWpmHistory}
              errorMarkers={errorDotHistory}
              durationSeconds={selectedDuration}
            />
          </div>
        </section>

        <section className="grid w-full grid-cols-2 gap-3 border-t border-[#44464a] pt-3 md:grid-cols-4 md:gap-4 md:pt-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              characters
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
              {correctKeystrokes}
              <span className="mx-1 text-[#646669]">/</span>
              <span className="text-[#ca4754]">{incorrectChars}</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              keystrokes
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">{totalKeystrokes}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              time
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">{safeSeconds}s</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              raw
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">{Math.round(rawWpm)}</div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-[#646669] md:gap-4 md:text-xs">
          {isHost ? (
            <button
              onClick={onRestart}
              className="transition-colors hover:text-[#e2b714]"
              type="button"
            >
              restart test
            </button>
          ) : (
            <div>waiting for host to restart</div>
          )}

          <button
            onClick={onExit}
            className="transition-colors hover:text-[#d1d0c5]"
            type="button"
          >
            back to multiplayer
          </button>
        </div>
      </div>
    </div>
  );
}
