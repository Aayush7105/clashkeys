"use client";

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
  return name.slice(0, 2).toUpperCase();
}

export default function MultiplayerLeaderboard({
  users,
  elapsedMs,
  currentUserId,
}: MultiplayerLeaderboardProps) {
  const rows = toLeaderboardRows(users, elapsedMs);
  const gridCols = "grid-cols-[2.5rem_minmax(0,1fr)_4rem_4.5rem_4rem]";

  return (
    <div className="space-y-2 border-t border-neutral-600 font-mono">
      {/* Header */}
      <div
        className={`grid ${gridCols} gap-2 px-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-[#646669] border-b border-[#2c2f36] pb-2`}
      >
        <div>rank</div>
        <div>player</div>
        <div className="text-right">wpm</div>
        <div className="text-right">acc</div>
        <div className="text-right">error</div>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-[#646669]">
          No players found in this room.
        </div>
      ) : (
        rows.map((row, index) => {
          const isCurrentUser = Boolean(
            currentUserId && row.id === currentUserId,
          );
          const isFirst = index === 0;

          return (
            <div
              key={row.id}
              className={`grid ${gridCols} items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                isCurrentUser
                  ? "border-[#e2b714]/60 bg-[#e2b714]/10 hover:border-[#e2b714]/80"
                  : "border-[#3a3f49] bg-neutral-900 hover:border-[#4a5060]"
              }`}
            >
              {/* Rank */}
              <div
                className={`font-semibold ${isFirst ? "text-[#e2b714]" : "text-[#646669]"}`}
              >
                #{index + 1}
              </div>

              {/* Player */}
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold ${
                    isCurrentUser
                      ? "border-[#e2b714]/40 bg-[#e2b714]/15 text-[#e2b714]"
                      : "border-[#3a3f49] bg-[#2a2d35] text-[#646669]"
                  }`}
                >
                  {getInitials(row.name)}
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-[#d1d0c5]">
                    {row.name}
                  </span>
                  {isCurrentUser && (
                    <span className="block text-[9px] leading-none tracking-[0.05em] text-[#e2b714]">
                      you
                    </span>
                  )}
                </div>
              </div>

              {/* WPM */}
              <div className="text-right">
                <span className="block text-[15px] font-semibold leading-none text-[#d1d0c5]">
                  {Math.round(row.wpm)}
                </span>
                <span className="block mt-0.5 text-[9px] tracking-[0.1em] text-[#646669]">
                  wpm
                </span>
              </div>

              {/* Accuracy */}
              <div className="text-right">
                <div className="mb-1 h-[2px] w-full rounded-full bg-[#2c2f36]">
                  <div
                    className="h-[2px] rounded-full bg-[#e2b714]"
                    style={{ width: `${row.accuracy}%` }}
                  />
                </div>
                <span className="text-[#d1d0c5]">
                  {Math.round(row.accuracy)}%
                </span>
              </div>

              {/* Errors */}
              <div
                className={`text-right ${row.errors === 0 ? "text-[#646669]" : "text-[#ca4754]"}`}
              >
                {row.errors}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}