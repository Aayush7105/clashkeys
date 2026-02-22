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

export default function MultiplayerLeaderboard({
  users,
  elapsedMs,
  currentUserId,
}: MultiplayerLeaderboardProps) {
  const rows = toLeaderboardRows(users, elapsedMs);
  const gridCols = "grid-cols-[2.5rem_minmax(0,1fr)_4rem_4.5rem_4rem]";

  return (
    <div className="space-y-2 border-t border-neutral-600">
      <div
        className={`grid ${gridCols} gap-2 px-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-[#646669]`}
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
          return (
            <div
              key={row.id}
              className={`grid ${gridCols} items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                isCurrentUser
                  ? "border-[#e2b714]/60 bg-[#e2b714]/10"
                  : "border-[#3a3f49] bg-neutral-900"
              }`}
            >
              <div className="font-semibold text-[#e2b714]">#{index + 1}</div>
              <div className="truncate text-[#d1d0c5]">
                {row.name}
                {isCurrentUser ? " (you)" : ""}
              </div>
              <div className="text-right text-[#d1d0c5]">
                {Math.round(row.wpm)}
              </div>
              <div className="text-right text-[#d1d0c5]">
                {Math.round(row.accuracy)}%
              </div>
              <div className="text-right text-[#ca4754]">{row.errors}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
