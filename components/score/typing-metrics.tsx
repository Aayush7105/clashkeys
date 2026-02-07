type TypingMetricsProps = {
  typed: string;
  text: string;
  durationSeconds?: number;
  keystrokes?: number;
  backspaces?: number;
};

type WordSpeed = {
  word: string;
  typed: string | null;
  wpm: number | null;
  correct: boolean;
};

type ConfusionCell = {
  target: string;
  typed: string;
  count: number;
};

function displayChar(value: string) {
  if (value === " ") return "␠";
  if (value === "\n") return "↵";
  if (value === "\t") return "⇥";
  return value;
}

function calcTypingMetrics(
  typed: string,
  text: string,
  durationSeconds?: number,
) {
  const safeTyped = typed ?? "";
  const safeText = text ?? "";

  const totalCharacters = safeText.length;
  const typedCharacters = safeTyped.length;
  const compareLength = Math.min(typedCharacters, totalCharacters);

  let correctCharacters = 0;
  const errorPositions: number[] = [];
  const missedPositions: number[] = [];

  for (let i = 0; i < totalCharacters; i += 1) {
    const target = safeText[i];
    const typedChar = safeTyped[i];

    if (typedChar === undefined) {
      missedPositions.push(i);
      continue;
    }

    if (typedChar === target) {
      correctCharacters += 1;
    } else {
      errorPositions.push(i);
    }
  }

  const incorrectCharacters = typedCharacters - correctCharacters;
  const missedCharacters = Math.max(0, totalCharacters - typedCharacters);
  const extraCharacters = Math.max(0, typedCharacters - totalCharacters);

  const accuracy =
    typedCharacters === 0 ? 0 : (correctCharacters / typedCharacters) * 100;
  const errorRate =
    typedCharacters === 0 ? 0 : (incorrectCharacters / typedCharacters) * 100;

  const durationMinutes =
    durationSeconds && durationSeconds > 0 ? durationSeconds / 60 : null;
  const wpmRaw = durationMinutes
    ? (correctCharacters / 5) / durationMinutes
    : correctCharacters / 5;
  const cpmRaw = durationMinutes
    ? typedCharacters / durationMinutes
    : typedCharacters;

  const charSet = new Set<string>();
  for (let i = 0; i < totalCharacters; i += 1) {
    charSet.add(safeText[i]);
  }
  for (let i = 0; i < compareLength; i += 1) {
    charSet.add(safeTyped[i]);
  }

  const sortedChars = Array.from(charSet).sort((a, b) => a.localeCompare(b));

  const confusionMatrix = new Map<string, Map<string, number>>();
  const confusionPairs: ConfusionCell[] = [];

  for (let i = 0; i < totalCharacters; i += 1) {
    const target = safeText[i];
    const typedChar = safeTyped[i] ?? "∅";

    if (!confusionMatrix.has(target)) {
      confusionMatrix.set(target, new Map());
    }

    const row = confusionMatrix.get(target)!;
    row.set(typedChar, (row.get(typedChar) ?? 0) + 1);

    if (typedChar !== target && typedChar !== "∅") {
      confusionPairs.push({ target, typed: typedChar, count: 1 });
    }
  }

  const mergedConfusions = new Map<string, ConfusionCell>();
  confusionPairs.forEach((pair) => {
    const key = `${pair.target}=>${pair.typed}`;
    const existing = mergedConfusions.get(key) ?? {
      target: pair.target,
      typed: pair.typed,
      count: 0,
    };
    existing.count += 1;
    mergedConfusions.set(key, existing);
  });

  const topConfusions = Array.from(mergedConfusions.values()).sort(
    (a, b) => b.count - a.count,
  );

  const targetWords = safeText.trim().length
    ? safeText.trim().split(/\s+/)
    : [];
  const typedWords = safeTyped.trim().length
    ? safeTyped.trim().split(/\s+/)
    : [];

  let correctWords = 0;
  let incorrectWords = 0;
  let missedWords = 0;
  const wrongWords: { target: string; typed: string | null }[] = [];

  const timePerChar =
    durationSeconds && typedCharacters > 0
      ? durationSeconds / typedCharacters
      : null;

  const wordSpeeds: WordSpeed[] = [];

  for (let i = 0; i < targetWords.length; i += 1) {
    const target = targetWords[i];
    const typedWord = typedWords[i];
    const wordCorrect = typedWord === target;

    if (typedWord === undefined) {
      missedWords += 1;
      wrongWords.push({ target, typed: null });
    } else if (wordCorrect) {
      correctWords += 1;
    } else {
      incorrectWords += 1;
      wrongWords.push({ target, typed: typedWord });
    }

    let wpm: number | null = null;
    if (timePerChar) {
      const wordSeconds = Math.max(0.1, target.length * timePerChar);
      const wordMinutes = wordSeconds / 60;
      wpm = (target.length / 5) / wordMinutes;
    }

    wordSpeeds.push({
      word: target,
      typed: typedWord ?? null,
      wpm: wpm ? Math.round(wpm) : null,
      correct: wordCorrect,
    });
  }

  const wordAccuracy =
    targetWords.length === 0
      ? 0
      : (correctWords / targetWords.length) * 100;

  const charStats = sortedChars.map((char) => {
    const row = confusionMatrix.get(char) ?? new Map();
    const total = Array.from(row.values()).reduce((sum, value) => sum + value, 0);
    const correct = row.get(char) ?? 0;
    const missed = row.get("∅") ?? 0;
    const incorrect = Math.max(0, total - correct - missed);
    const acc = total === 0 ? 0 : (correct / total) * 100;
    return {
      char,
      total,
      correct,
      incorrect,
      missed,
      accuracy: acc,
    };
  });

  const worstChars = charStats
    .filter((stat) => stat.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  return {
    summary: {
      totalCharacters,
      typedCharacters,
      correctCharacters,
      incorrectCharacters,
      missedCharacters,
      extraCharacters,
      accuracy,
      errorRate,
      wpm: Math.round(wpmRaw),
      cpm: Math.round(cpmRaw),
      usesDuration: Boolean(durationMinutes),
    },
    errorPositions,
    missedPositions,
    characters: {
      all: charStats,
      worst: worstChars,
      confusions: topConfusions,
      matrix: confusionMatrix,
      matrixChars: sortedChars,
    },
    words: {
      totalWords: targetWords.length,
      typedWords: typedWords.length,
      correctWords,
      incorrectWords,
      missedWords,
      accuracy: wordAccuracy,
      wrongWords,
      speeds: wordSpeeds,
    },
  };
}

export default function TypingMetrics({
  typed,
  text,
  durationSeconds,
  keystrokes,
  backspaces,
}: TypingMetricsProps) {
  const metrics = calcTypingMetrics(typed, text, durationSeconds);

  const summaryCards = [
    {
      label: metrics.summary.usesDuration ? "WPM" : "WPM (Est.)",
      value: metrics.summary.wpm,
    },
    {
      label: "Accuracy",
      value: `${metrics.summary.accuracy.toFixed(0)}%`,
    },
    {
      label: "Correct",
      value: metrics.summary.correctCharacters,
    },
    {
      label: "Errors",
      value: metrics.summary.incorrectCharacters,
    },
    {
      label: "Missed",
      value: metrics.summary.missedCharacters,
    },
    {
      label: "Extra",
      value: metrics.summary.extraCharacters,
    },
    {
      label: "CPM",
      value: metrics.summary.cpm,
    },
    {
      label: "Keystrokes",
      value: keystrokes ?? "—",
    },
    {
      label: "Backspaces",
      value: backspaces ?? "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {card.label}
            </div>
            <div className="mt-2 text-3xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Errors</h2>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {metrics.errorPositions.length} wrong,{" "}
            {metrics.missedPositions.length} missed
          </div>
        </div>
        <div className="mt-3 text-sm text-zinc-300">
          Wrong positions:{" "}
          {metrics.errorPositions.length === 0
            ? "None"
            : metrics.errorPositions.join(", ")}
        </div>
        <div className="mt-1 text-sm text-zinc-300">
          Missed positions:{" "}
          {metrics.missedPositions.length === 0
            ? "None"
            : metrics.missedPositions.join(", ")}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Character Stats</h2>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Lowest accuracy
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {metrics.characters.worst.length === 0 ? (
              <div className="text-sm text-zinc-500">No data yet.</div>
            ) : (
              metrics.characters.worst.map((stat) => (
                <div
                  key={stat.char}
                  className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300"
                >
                  <span className="font-semibold text-zinc-100">
                    {displayChar(stat.char)}
                  </span>{" "}
                  {stat.accuracy.toFixed(0)}% · {stat.total} hits
                </div>
              ))
            )}
          </div>

          <div className="mt-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Top Confusions
          </div>
          <div className="mt-3 space-y-2">
            {metrics.characters.confusions.length === 0 ? (
              <div className="text-sm text-zinc-500">No mistakes recorded.</div>
            ) : (
              metrics.characters.confusions.map((confusion, index) => (
                <div
                  key={`${confusion.target}-${confusion.typed}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300"
                >
                  <div>
                    <span className="font-semibold text-zinc-100">
                      {displayChar(confusion.target)}
                    </span>{" "}
                    →{" "}
                    <span className="font-semibold text-zinc-100">
                      {displayChar(confusion.typed)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {confusion.count}x
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Word Stats</h2>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {metrics.words.accuracy.toFixed(0)}% accuracy
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total", value: metrics.words.totalWords },
              { label: "Correct", value: metrics.words.correctWords },
              { label: "Missed", value: metrics.words.missedWords },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Wrong Words
          </div>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
            {metrics.words.wrongWords.length === 0 ? (
              <div className="text-sm text-zinc-500">No wrong words.</div>
            ) : (
              metrics.words.wrongWords.map((miss, index) => (
                <div
                  key={`${miss.target}-${index}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300"
                >
                  <span className="font-semibold text-zinc-100">
                    {miss.target}
                  </span>
                  {miss.typed ? (
                    <span className="text-zinc-500">
                      {" "}
                      (typed {miss.typed})
                    </span>
                  ) : (
                    <span className="text-zinc-500"> (missed)</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Per-word Speed (Est.)
          </div>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
            {metrics.words.speeds.length === 0 ? (
              <div className="text-sm text-zinc-500">No data yet.</div>
            ) : (
              metrics.words.speeds.map((word, index) => (
                <div
                  key={`${word.word}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">
                      {word.word}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {word.correct ? "correct" : "wrong"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {word.wpm === null ? "—" : `${word.wpm} wpm`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Confusion Matrix</h2>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Full table
          </div>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-max border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 bg-zinc-950/90 border border-zinc-800 px-2 py-1 text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Target
                </th>
                {metrics.characters.matrixChars.map((char) => (
                  <th
                    key={`col-${char}`}
                    className="border border-zinc-800 px-2 py-1 text-xs uppercase tracking-[0.2em] text-zinc-500"
                  >
                    {displayChar(char)}
                  </th>
                ))}
                <th className="border border-zinc-800 px-2 py-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  ∅
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.characters.matrixChars.map((rowChar) => {
                const row = metrics.characters.matrix.get(rowChar) ?? new Map();
                return (
                  <tr key={`row-${rowChar}`}>
                    <td className="sticky left-0 bg-zinc-950/90 border border-zinc-800 px-2 py-1 font-semibold text-zinc-100">
                      {displayChar(rowChar)}
                    </td>
                    {metrics.characters.matrixChars.map((colChar) => (
                      <td
                        key={`cell-${rowChar}-${colChar}`}
                        className="border border-zinc-800 px-2 py-1 text-center text-zinc-300"
                      >
                        {row.get(colChar) ?? ""}
                      </td>
                    ))}
                    <td className="border border-zinc-800 px-2 py-1 text-center text-zinc-300">
                      {row.get("∅") ?? ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
