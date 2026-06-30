import React, { useEffect } from "react";
import WpmGraph from "./wpmgraph";
import { RxReload } from "react-icons/rx";

interface Props {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
  onRestart: () => void;
  selectedDuration: number;
  wpmHistory: number[];
  rawWpmHistory: number[];
  burstWpmHistory: number[];
  errorPoints: Array<{ second: number; wpm: number }>;
}

const SoloScorePage: React.FC<Props> = ({
  wpm,
  rawWpm,
  accuracy,
  correctChars,
  incorrectChars,
  totalChars,
  timeElapsed,
  onRestart,
  selectedDuration,
  wpmHistory,
  rawWpmHistory,
  burstWpmHistory,
  errorPoints,
}) => {
  // Scroll to top on mount
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const accuracyColor =
    accuracy >= 95
      ? "text-[#7fae5a]"
      : accuracy >= 90
        ? "text-[#e2b714]"
        : "text-[#ca4754]";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 text-[#d1d0c5]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-3 px-3 py-6 font-mono md:gap-5 md:px-4 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-5xl font-semibold uppercase tracking-normal text-neutral-400">
            Test completed
            <br />
            <span className="text-3xl tracking-normal">solo play</span>
          </p>
        </div>

        <section className="flex w-full flex-col gap-2 md:gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-4 md:gap-6 lg:w-[15%] lg:flex-col">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                wpm
              </div>
              <div className="text-4xl font-semibold leading-none text-[#e2b714] md:text-6xl">
                {Math.round(wpm)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                acc
              </div>
              <div
                className={`text-4xl font-semibold leading-none md:text-6xl ${accuracyColor}`}
              >
                {Math.round(accuracy)}%
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[85%]">
            <WpmGraph
              wpmData={wpmHistory}
              rawWpmData={rawWpmHistory}
              burstWpmData={burstWpmHistory}
              errorPoints={errorPoints}
              durationSeconds={selectedDuration}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#30343d] bg-[#14161a] font-mono">
          <div className="flex flex-col gap-3 border-b border-[#30343d] bg-[#181b20] px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#646669]">
                score breakdown
              </p>
              <h2 className="mt-1 text-2xl font-semibold leading-none text-[#d1d0c5] sm:text-3xl">
                Metrics
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#646669]">
                duration
              </p>
              <p className="mt-0.5 text-lg font-semibold leading-none text-[#e2b714]">
                {timeElapsed}s
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] gap-2 border-b border-[#30343d] bg-[#111317] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#646669] sm:grid-cols-[minmax(0,1fr)7rem_7rem]">
            <div>metric</div>
            <div className="text-right">value</div>
            <div className="text-right">detail</div>
          </div>

          <div className="divide-y divide-[#242832]">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-2 px-4 py-3.5 text-sm sm:grid-cols-[minmax(0,1fr)7rem_7rem]">
              <div>
                <div className="text-[15px] font-semibold leading-tight text-[#d1d0c5]">
                  Characters
                </div>
              </div>
              <div className="text-right text-xl font-semibold leading-none text-[#d1d0c5] tabular-nums">
                {correctChars}
              </div>
              <div className="text-right text-sm font-semibold text-[#8f949e] tabular-nums">
                <span className="text-[#d1d0c5]">{correctChars}</span>
                <span className="mx-1 text-[#646669]">/</span>
                <span className="text-[#ca4754]">{incorrectChars}</span>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-2 px-4 py-3.5 text-sm sm:grid-cols-[minmax(0,1fr)7rem_7rem]">
              <div>
                <div className="text-[15px] font-semibold leading-tight text-[#d1d0c5]">
                  Keystrokes
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#646669]">
                  total input
                </p>
              </div>
              <div className="text-right text-xl font-semibold leading-none text-[#d1d0c5] tabular-nums">
                {totalChars}
              </div>
              <div className="text-right text-sm font-semibold uppercase text-emerald-500 tabular-nums">
                {correctChars}
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-2 px-4 py-3.5 text-sm sm:grid-cols-[minmax(0,1fr)7rem_7rem]">
              <div>
                <div className="text-[15px] font-semibold leading-tight text-[#d1d0c5]">
                  Raw speed
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#646669]">
                  before errors
                </p>
              </div>
              <div className="text-right text-xl font-semibold leading-none text-[#d1d0c5] tabular-nums">
                {Math.round(rawWpm)}
              </div>
              <div className="text-right text-sm font-semibold uppercase text-[#8f949e]">
                wpm
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-2 px-4 py-3.5 text-sm sm:grid-cols-[minmax(0,1fr)7rem_7rem]">
              <div>
                <div className="text-[15px] font-semibold leading-tight text-[#d1d0c5]">
                  Errors
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#646669]">
                  missed characters
                </p>
              </div>
              <div className="text-right text-xl font-semibold leading-none text-[#ca4754] tabular-nums">
                {incorrectChars}
              </div>
              <div className="text-right text-sm font-semibold uppercase text-[#8f949e] tabular-nums">
                {Math.round(accuracy)}% acc
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 w-full border-t border-[#44464a] pt-3 md:pt-4">
          <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-[#e2b714] md:text-sm"
            type="button"
            aria-label="restart test"
          >
            <RxReload className="size-7" />
          </button>
          <button
            onClick={onRestart}
            className="rounded-xl text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:border-[#e2b714] hover:text-[#e2b714] md:text-sm"
            type="button"
          >
            go back
          </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SoloScorePage;
