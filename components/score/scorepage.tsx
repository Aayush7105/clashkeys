type ScorePageProps = {
  name: string;
  roomId: string;
  typed: string;
  text: string;
  onRestart: () => void;
  onExit: () => void;
};

function calcStats(typed: string, text: string) {
  let correct = 0;
  const len = Math.min(typed.length, text.length);
  for (let i = 0; i < len; i += 1) {
    if (typed[i] === text[i]) correct += 1;
  }

  const accuracy = typed.length === 0 ? 0 : (correct / typed.length) * 100;
  const wpm = Math.round(correct / 5);
  return { correct, accuracy, wpm };
}

export default function ScorePage({
  name,
  roomId,
  typed,
  text,
  onRestart,
  onExit,
}: ScorePageProps) {
  const { correct, accuracy, wpm } = calcStats(typed, text);

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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              WPM
            </div>
            <div className="mt-2 text-3xl font-bold">{wpm}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Accuracy
            </div>
            <div className="mt-2 text-3xl font-bold">
              {accuracy.toFixed(0)}%
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Correct
            </div>
            <div className="mt-2 text-3xl font-bold">{correct}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRestart}
            className="px-4 py-2 rounded bg-emerald-500 text-emerald-950 font-semibold"
          >
            Play again
          </button>
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
