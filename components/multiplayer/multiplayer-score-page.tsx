"use client";

import React, { useEffect } from "react";
import { Trophy, Zap, Target } from "lucide-react";
import { TbReload } from "react-icons/tb";
import WpmGraph from "../soloplay/wpmgraph";

type MultiplayerScorePageProps = {
  roomId: string;
  elapsedSeconds: number;
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
    window.scrollTo(0, 0);
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
      ? "text-emerald-400"
      : accuracy >= 90
        ? "text-amber-400"
        : "text-orange-400";

  return (
    <div className="fixed inset-0 z-100 bg-neutral-950 overflow-y-auto min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-6xl flex flex-col items-center space-y-12">
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] animate-in slide-in-from-top duration-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Test Completed · Room {roomId}</span>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          <div className="lg:col-span-1 space-y-8 flex flex-col items-center lg:items-start">
            <div className="animate-in slide-in-from-left duration-700 delay-100">
              <div className="text-neutral-500 font-mono text-xl mb-1">wpm</div>
              <div className="text-7xl md:text-8xl font-bold text-yellow-500 font-mono leading-none tracking-tighter">
                {Math.round(wpm)}
              </div>
            </div>
            <div className="animate-in slide-in-from-left duration-700 delay-200">
              <div className="text-neutral-500 font-mono text-xl mb-1">acc</div>
              <div
                className={`text-7xl md:text-8xl font-bold font-mono leading-none tracking-tighter ${accuracyColor}`}
              >
                {Math.round(accuracy)}%
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 w-full bg-neutral-900/20 rounded-xl p-4 animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="h-62.5 w-full">
              <WpmGraph
                wpmData={wpmHistory}
                rawWpmData={rawWpmHistory}
                errorMarkers={errorDotHistory}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-neutral-900 pt-12 w-full max-w-4xl animate-in slide-in-from-bottom duration-700 delay-500">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2 tracking-widest">
              <Zap className="w-3 h-3 text-blue-400" /> characters
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {correctKeystrokes}
              <span className="text-neutral-700 mx-1">/</span>
              <span className="text-red-500/80">{incorrectChars}</span>
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2 tracking-widest">
              <Target className="w-3 h-3 text-purple-400" /> keystrokes
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {totalKeystrokes}
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 tracking-widest">
              time
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {safeSeconds}s
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 tracking-widest">
              raw wpm
            </span>
            <span className="text-4xl font-mono text-neutral-500">
              {Math.round(rawWpm)}
            </span>
          </div>
        </div>

        {/* <div className="w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono mb-4">
            Leaderboard
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const entryWpm =
                timeMinutes > 0 ? Math.round((entry.correctChars / 5) / timeMinutes) : 0;
              const entryAccuracy =
                entry.totalKeystrokes > 0
                  ? Math.round((entry.correctChars / entry.totalKeystrokes) * 100)
                  : 0;
              const isMe = Boolean(socketId && entry.id === socketId);

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[40px_1fr_80px_80px_80px] items-center gap-3 rounded-lg border px-3 py-2 text-sm font-mono ${
                    isMe
                      ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-100"
                      : "border-neutral-800 bg-neutral-950/50 text-neutral-300"
                  }`}
                >
                  <div className="text-neutral-500">#{index + 1}</div>
                  <div className="truncate">{entry.name}</div>
                  <div className="text-right">{entry.progress}%</div>
                  <div className="text-right">{entryWpm} wpm</div>
                  <div className="text-right">{entryAccuracy}%</div>
                </div>
              );
            })}
          </div>
        </div> */}

        <div className="flex flex-col items-center gap-8 pt-4 animate-in fade-in duration-1000 delay-700">
          {isHost ? (
            <button
              onClick={onRestart}
              className="group flex flex-col items-center gap-3 transition-all"
              title="Restart Test"
              type="button"
            >
              <TbReload className="size-5 text-neutral-600 group-hover:text-yellow-500 transition-colors cursor-pointer" />
              <span className="text-neutral-600 group-hover:text-neutral-400 font-mono text-xs uppercase tracking-widest">
                Restart Test
              </span>
            </button>
          ) : (
            <div className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em]">
              Waiting for host to restart
            </div>
          )}

          <button
            onClick={onExit}
            className="text-neutral-700 hover:text-neutral-400 font-mono text-xs uppercase tracking-[0.3em] transition-colors"
            type="button"
          >
            back to multiplayer
          </button>
        </div>
      </div>
    </div>
  );
}
