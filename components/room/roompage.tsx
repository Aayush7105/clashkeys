"use client";

type RoomUser = {
  id: string;
  name: string;
  progress: number;
};

type RoomPageProps = {
  roomId: string;
  name: string;
  users: RoomUser[];
  hostId: string | null;
  isHost: boolean;
  onStart: () => void;
  onExit: () => void;
};

export default function RoomPage({
  roomId,
  name,
  users,
  hostId,
  isHost,
  onStart,
  onExit,
}: RoomPageProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Room {roomId}</h1>
            <p className="text-zinc-400">Waiting room · {name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isHost ? (
              <button
                onClick={onStart}
                className="px-4 py-2 rounded bg-emerald-500 text-emerald-950 font-semibold"
              >
                Start test
              </button>
            ) : (
              <div className="rounded-full border border-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                Waiting for host
              </div>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2 rounded border border-zinc-700 text-zinc-100 font-semibold"
            >
              Back
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Players</h2>
              <p className="text-sm text-zinc-500">
                {users.length === 0
                  ? "Waiting for players to join..."
                  : `${users.length} player${users.length === 1 ? "" : "s"} in room`}
              </p>
            </div>
            <div className="text-sm text-zinc-500">Share code: {roomId}</div>
          </div>

          <div className="mt-4 space-y-3">
            {users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
                No players yet.
              </div>
            ) : (
              users.map((user) => {
                const isRoomHost = hostId && user.id === hostId;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold">
                        {user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">
                          {user.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {isRoomHost ? "Host" : "Player"}
                        </div>
                      </div>
                    </div>
                    {isRoomHost && (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Host
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
          {isHost
            ? "You are the host. Start the test when everyone is ready."
            : "Only the host can start the test. You will be moved into the race automatically."}
        </div>
      </div>
    </main>
  );
}
