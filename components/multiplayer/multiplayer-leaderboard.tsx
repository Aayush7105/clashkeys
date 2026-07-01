"use client";

import { motion } from "framer-motion";
import type { RoomUser } from "./multiplayer-types";

type MultiplayerLeaderboardProps = {
  users: RoomUser[];
  elapsedMs: number;
  currentUserId?: string | null;
};

export type LeaderboardRow = {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalKeystrokes: number;
  progress: number;
};

export function toLeaderboardRows(
  users: RoomUser[],
  elapsedMs: number,
): LeaderboardRow[] {
  const safeElapsedMs = Math.max(1000, elapsedMs);
  const timeMinutes = safeElapsedMs / 60000;

  return users
    .map((user) => {
      const totalKeystrokes = Math.max(0, user.totalKeystrokes);
      const correctChars = Math.max(0, user.correctChars);
      const errors = Math.max(0, totalKeystrokes - correctChars);
      const accuracy =
        totalKeystrokes === 0 ? 100 : (correctChars / totalKeystrokes) * 100;
      const wpm = timeMinutes > 0 ? correctChars / 5 / timeMinutes : 0;

      return {
        id: user.id,
        name: user.name || "Player",
        wpm,
        accuracy,
        errors,
        correctChars,
        totalKeystrokes,
        progress: Math.min(100, Math.max(0, Math.round(user.progress))),
      };
    })
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.errors !== b.errors) return a.errors - b.errors;
      return b.correctChars - a.correctChars;
    });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MultiplayerLeaderboard({
  users,
  elapsedMs,
  currentUserId,
}: MultiplayerLeaderboardProps) {
  const rows = toLeaderboardRows(users, elapsedMs);
  const currentUserRow = currentUserId
    ? rows.find((row) => row.id === currentUserId)
    : undefined;
  const currentRank = currentUserRow
    ? rows.findIndex((row) => row.id === currentUserRow.id) + 1
    : null;
  const gridCols =
    "grid-cols-[3rem_minmax(0,1fr)_4rem_4.5rem_4rem] sm:grid-cols-[3.5rem_minmax(0,1fr)_5rem_5rem_4.5rem]";
  const rowDropVariants = {
    hidden: {
      opacity: 0,
      y: -22,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="overflow-hidden rounded-lg ring ring-neutral-900 bg-neutral-950 font-mono">
      <div className="flex flex-col gap-3 ring-b ring-neutral-900 bg-neutral-950 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-normal text-[#646669]">
            final standings
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-none text-[#d1d0c5] sm:text-3xl">
            Leaderboard
          </h2>
        </div>
        <div className="flex gap-7 text-left sm:text-right">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-noraml text-[#646669]">
              players
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-none text-[#d1d0c5]">
              {rows.length}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-normal text-[#646669]">
              your rank
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-none text-[#e2b714]">
              {currentRank ? `#${currentRank}` : "--"}
            </p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#646669]">
          No players found in this room.
        </div>
      ) : (
        <>
          <div
            className={`grid ${gridCols} gap-2 ring-b ring-neutral-900 bg-neutral-900 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#646669]`}
          >
            <div className="text-sm">rank</div>
            <div className="text-sm">player</div>
            <div className="text-right text-sm">wpm</div>
            <div className="text-right text-sm">acc</div>
            <div className="text-right text-sm">error</div>
          </div>

          <motion.div
            className="divide-y divide-neutral-800"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.08,
                },
              },
            }}
          >
            {rows.map((row, index) => {
              const rank = index + 1;
              const isCurrentUser = Boolean(
                currentUserId && row.id === currentUserId,
              );
              const isFirst = rank === 1;
              const rankColor =
                rank === 1
                  ? "text-[#e2b714]"
                  : rank === 2
                    ? "text-sky-300"
                    : rank === 3
                      ? "text-emerald-300"
                      : "text-[#646669]";

              return (
                <motion.div
                  key={row.id}
                  variants={rowDropVariants}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 34,
                    mass: 0.8,
                  }}
                  className={`grid ${gridCols} items-center gap-2 px-4 py-3.5 text-sm transition-colors ${
                    isCurrentUser
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-900"
                  }`}
                >
                  <div>
                    <div
                      className={`text-base font-semibold leading-none ${rankColor}`}
                    >
                      #{rank}
                    </div>
                    {isFirst && (
                      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e2b714]/80">
                        lead
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-md ring text-[11px] font-semibold ${
                        isCurrentUser
                          ? "ring-neutral-800 bg-neutral-900 text-[#e2b714]"
                          : "ring-neutral-800 bg-neutral-900 text-[#8f949e]"
                      }`}
                    >
                      {getInitials(row.name) || "P"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[15px] font-semibold leading-tight text-[#d1d0c5]">
                          {row.name}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-sm ring ring-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                            you
                          </span>
                        )}
                      </div>
                      
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-xl font-semibold leading-none text-[#d1d0c5]">
                      {Math.round(row.wpm)}
                    </span>
                    
                  </div>

                  <div className="text-right">
                    
                    <span className="text-lg font-semibold text-[#d1d0c5]">
                      {Math.round(row.accuracy)}%
                    </span>
                  </div>

                  <div
                    className={`text-right text-base font-semibold ${
                      row.errors === 0 ? "text-[#646669]" : "text-[#ca4754]"
                    }`}
                  >
                    <span className="tabular-nums">
                      {row.errors}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}
