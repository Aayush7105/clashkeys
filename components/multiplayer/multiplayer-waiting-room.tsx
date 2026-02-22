"use client";

import type { RoomUser } from "./multiplayer-types";

type MultiplayerWaitingRoomProps = {
  roomId: string;
  name: string;
  users: RoomUser[];
  hostId: string | null;
  isHost: boolean;
  selectedDuration: number;
  onStart: () => void;
  onExit: () => void;
};

export default function MultiplayerWaitingRoom({
  roomId,
  name,
  users,
  hostId,
  isHost,
  selectedDuration,
  onStart,
  onExit,
}: MultiplayerWaitingRoomProps) {
  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8 px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono text-neutral-200">
            Room {roomId}
          </h1>
          <p className="text-neutral-400 font-mono mt-1">
            Waiting room · {name}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
            {" "}
            Duration {selectedDuration}
            <span className="text-[10px]">s</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isHost ? (
            <button
              onClick={onStart}
              className="px-4 py-2 rounded-xl bg-[#e2b714] text-neutral-900 font-mono font-bold cursor-pointer hover:brightness-110"
              type="button"
            >
              Start test
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl border border-neutral-700 text-sm uppercase text-neutral-400 font-mono tracking-wide">
              Waiting for host
            </div>
          )}
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl border border-[#3a3f49] text-neutral-200 font-bold font-mono cursor-pointer hover:border-yellow-500"
            type="button"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#3a3f49] bg-neutral-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Players</h2>
            <p className="text-sm text-neutral-400">
              {users.length === 0
                ? "Waiting for players to join..."
                : `${users.length} player${users.length === 1 ? "" : "s"} in room`}
            </p>
          </div>
          <div className="text-sm text-neutral-300 font-mono">
            Share code: {roomId}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
              No players yet.
            </div>
          ) : (
            users.map((user) => {
              const isRoomHost = Boolean(hostId && user.id === hostId);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-neutral-800 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-neutral-900 flex items-center justify-center text-sm font-semibold border border-neutral-600">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-200">
                        {user.name}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {isRoomHost ? "Host" : "Player"}
                      </div>
                    </div>
                  </div>
                  {isRoomHost && (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 font-mono">
                      Host
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900 p-6 text-sm text-zinc-400 font-mono">
        {isHost
          ? "You are the host. Duration controls are enabled for you."
          : "Only the host can start and control duration. You will sync automatically when the race starts."}
      </div>
    </div>
  );
}
