"use client";

import React, { useEffect, useMemo, useState } from "react";
import WpmGraph from "../soloplay/wpmgraph";
import MultiplayerLeaderboard, {
  toLeaderboardRows,
} from "./multiplayer-leaderboard";
import type { RoomUser } from "./multiplayer-types";
import { RiResetRightFill } from "react-icons/ri";

type MultiplayerScorePageProps = {
  roomId: string;
  elapsedMs: number;
  selectedDuration: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  wpmHistory: number[];
  rawWpmHistory: number[];
  burstWpmHistory: number[];
  errorPoints: Array<{ second: number; wpm: number }>;
  users: RoomUser[];
  currentUserId?: string | null;
  isHost: boolean;
  onRestart: () => void;
  onExit: () => void;
};

export default function MultiplayerScorePage({
  roomId,
  elapsedMs,
  selectedDuration,
  totalKeystrokes,
  correctKeystrokes,
  wpmHistory,
  rawWpmHistory,
  burstWpmHistory,
  errorPoints,
  users,
  currentUserId,
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

  const safeElapsedMs = Math.max(1000, elapsedMs);
  const safeSeconds = Math.round(safeElapsedMs / 1000);
  const timeMinutes = safeElapsedMs / 60000;

  const accuracy =
    totalKeystrokes === 0 ? 100 : (correctKeystrokes / totalKeystrokes) * 100;
  const rawWpm = timeMinutes > 0 ? totalKeystrokes / 5 / timeMinutes : 0;
  const wpm = timeMinutes > 0 ? correctKeystrokes / 5 / timeMinutes : 0;
  const incorrectChars = Math.max(0, totalKeystrokes - correctKeystrokes);
  const [showLeaderboardOnly, setShowLeaderboardOnly] = useState(false);

  const leaderboardRows = useMemo(
    () => toLeaderboardRows(users, safeElapsedMs),
    [users, safeElapsedMs],
  );
  const currentRank = useMemo(() => {
    if (!currentUserId) return null;
    const rankIndex = leaderboardRows.findIndex(
      (row) => row.id === currentUserId,
    );
    return rankIndex >= 0 ? rankIndex + 1 : null;
  }, [leaderboardRows, currentUserId]);

  const accuracyColor =
    accuracy >= 95
      ? "text-[#7fae5a]"
      : accuracy >= 90
        ? "text-[#e2b714]"
        : "text-[#ca4754]";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 text-[#d1d0c5]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-3 px-3 py-6 font-mono md:gap-5 md:px-4 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400 font-semibold mt-">
            Test completed - room {roomId}
          </p>
          <button
            onClick={() => setShowLeaderboardOnly((value) => !value)}
            className="rounded-lg border border-[#3a3f49] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d1d0c5] transition-colors hover:border-[#e2b714] hover:text-[#e2b714]"
            type="button"
          >
            {showLeaderboardOnly ? "show score" : "see leaderboard"}
          </button>
        </div>

        {!showLeaderboardOnly ? (
          <>
            <section className="flex w-full flex-col gap-2 md:gap-4 lg:flex-row lg:items-start">
              <div className="flex gap-4 md:gap-6 lg:w-[15%] lg:flex-col">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    rank
                  </div>
                  <div className="text-4xl font-semibold leading-none text-[#e2b714] md:text-6xl">
                    {currentRank ? `#${currentRank}` : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    wpm
                  </div>
                  <div className="text-4xl font-semibold leading-none text-[#e2b714] md:text-6xl">
                    {Math.round(wpm)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
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
                  burstWpmData={burstWpmHistory}
                  errorPoints={errorPoints}
                  durationSeconds={selectedDuration}
                />
              </div>
            </section>

            <section className="grid w-full grid-cols-2 gap-3 border-t border-[#44464a] pt-3 md:grid-cols-5 md:gap-4 md:pt-4">
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
                <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
                  {totalKeystrokes}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                  time
                </div>
                <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
                  {safeSeconds}s
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                  raw
                </div>
                <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
                  {Math.round(rawWpm)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                  errors
                </div>
                <div className="mt-1 text-xl text-[#ca4754] md:mt-1.5 md:text-3xl">
                  {incorrectChars}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="w-full border-t border-[#44464a] pt-3 md:pt-4">
            <div className="mb-2 text-lg uppercase tracking-[0.2em] text-neutral-300 font-semibold">
              Room leaderboard
            </div>
            <MultiplayerLeaderboard
              users={users}
              elapsedMs={safeElapsedMs}
              currentUserId={currentUserId}
            />
          </section>
        )}

        <section className="w-full border-t mt-3 border-[#44464a] pt-3 md:pt-4">
          <div className="flex flex-col justify-center items-center gap-2">
            {isHost ? (
              <button
                onClick={onRestart}
                className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-[#e2b714] md:text-sm"
                type="button"
                aria-label="restart test"
              >
                <RiResetRightFill className="size-7" />
              </button>
            ) : (
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 md:text-xs">
                only host can restart
              </p>
            )}

            <button
              onClick={onExit}
              className="rounded-xl text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:border-[#e2b714] hover:text-[#e2b714] md:text-sm"
              type="button"
            >
              go back
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
