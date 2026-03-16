"use client";

import type { RoomUser, SocketConnectionStatus } from "./multiplayer-types";
import type { SoloMode } from "../soloplay/soloplay-modes";

type MultiplayerWaitingRoomProps = {
  roomId: string;
  name: string;
  users: RoomUser[];
  hostId: string | null;
  isHost: boolean;
  connectionStatus: SocketConnectionStatus;
  connectionError: string | null;
  selectedDuration: number;
  selectedMode: SoloMode;
  onStart: () => void;
  onExit: () => void;
  onRetryConnection: () => void;
};

export default function MultiplayerWaitingRoom({
  roomId,
  name,
  users,
  hostId,
  isHost,
  connectionStatus,
  connectionError,
  selectedDuration,
  selectedMode,
  onStart,
  onExit,
  onRetryConnection,
}: MultiplayerWaitingRoomProps) {
  const connectionLabel =
    connectionStatus === "connected"
      ? "Connected"
      : connectionStatus === "reconnecting"
        ? "Reconnecting..."
        : connectionStatus === "error"
          ? "Connection failed"
          : "Connecting...";

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl space-y-6 px-2 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-neutral-200 md:text-3xl">
            Room {roomId}
          </h1>
          <p className="mt-1 text-neutral-400 font-mono">
            Waiting room - {name}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Mode {selectedMode}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Duration {selectedDuration}
            <span className="text-[10px]">s</span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {isHost ? (
            <button
              onClick={onStart}
              className="w-full rounded-xl bg-[#e2b714] px-4 py-2 font-mono font-bold text-neutral-900 hover:brightness-110 cursor-pointer sm:w-auto"
              type="button"
            >
              Start test
            </button>
          ) : (
            <div className="w-full rounded-xl border border-neutral-700 px-4 py-2 text-center text-sm uppercase tracking-wide text-neutral-400 font-mono sm:w-auto">
              Waiting for host
            </div>
          )}
          <button
            onClick={onExit}
            className="w-full rounded-xl border border-[#3a3f49] px-4 py-2 text-neutral-200 font-bold font-mono hover:border-yellow-500 cursor-pointer sm:w-auto"
            type="button"
          >
            Back
          </button>
        </div>
      </div>
      {/* 
      <div className="rounded-xl border border-[#3a3f49] bg-neutral-900 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Socket status
            </p>
            <p
              className={`font-mono text-sm ${
                connectionStatus === "connected"
                  ? "text-emerald-300"
                  : connectionStatus === "error"
                    ? "text-rose-300"
                    : "text-yellow-300"
              }`}
            >
              {connectionLabel}
            </p>
            <p className="mt-1 text-xs text-neutral-400 font-mono">
              {connectionError ??
                "If this takes too long, retry to reconnect to the room."}
            </p>
          </div>
          {connectionStatus !== "connected" && (
            <button
              type="button"
              onClick={onRetryConnection}
              className="w-full rounded-xl border border-[#e2b714] px-4 py-2 font-mono text-[#e2b714] hover:bg-[#e2b714]/10 cursor-pointer sm:w-auto"
            >
              Retry connection
            </button>
          )}
        </div>
      </div> */}

      <div className="rounded-xl border border-[#3a3f49] bg-neutral-900 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Players</h2>
            <p className="text-sm text-neutral-400 font-mono">
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900 text-sm font-semibold">
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

      <div className="rounded-xl bg-neutral-900 p-4 text-sm text-zinc-400 font-mono md:p-6">
        {isHost
          ? "You are the host. Mode and duration controls are enabled for you."
          : "Only the host can start and control mode and duration. You will sync automatically when the race starts."}
      </div>
    </div>
  );
}
