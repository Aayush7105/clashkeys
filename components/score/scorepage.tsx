import TypingMetrics from "./typing-metrics";

type ScorePageProps = {
  name: string;
  roomId: string;
  typed: string;
  text: string;
  durationSeconds: number;
  keystrokes?: number;
  backspaces?: number;
  onRestart: () => void;
  onExit: () => void;
  isHost?: boolean;
};

export default function ScorePage({
  name,
  roomId,
  typed,
  text,
  durationSeconds,
  keystrokes,
  backspaces,
  onRestart,
  onExit,
  isHost = true,
}: ScorePageProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Score</h1>
            <p className="text-zinc-400">
              Room {roomId} · {name}
            </p>
          </div>
        </div>

        <TypingMetrics
          typed={typed}
          text={text}
          durationSeconds={durationSeconds}
          keystrokes={keystrokes}
          backspaces={backspaces}
        />

        <div className="flex flex-wrap gap-3">
          {isHost ? (
            <button
              onClick={onRestart}
              className="px-4 py-2 rounded bg-emerald-500 text-emerald-950 font-semibold"
            >
              Play again
            </button>
          ) : (
            <div className="px-4 py-2 rounded border border-zinc-700 text-zinc-400 font-semibold">
              Waiting for host to restart
            </div>
          )}
          <button
            onClick={onExit}
            className="px-4 py-2 rounded border border-zinc-700 text-zinc-100 font-semibold"
          >
            Back to multiplayer
          </button>
        </div>
      </div>
    </main>
  );
}
