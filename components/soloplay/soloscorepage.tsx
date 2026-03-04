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
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950 text-[#d1d0c5]">
      <div className="mx-auto flex h-screen w-full max-w-7xl flex-col justify-center gap-3 px-3 py-3 font-mono md:gap-5 md:px-4 md:py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-200">
          Test completed
        </p>

        <section className="flex w-full flex-col gap-2 md:gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-4 md:gap-6 lg:w-[15%] lg:flex-col">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
                wpm
              </div>
              <div className="text-4xl font-semibold leading-none text-[#e2b714] md:text-6xl">
                {Math.round(wpm)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
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

        <section className="grid w-full grid-cols-2 gap-3 border-t border-[#44464a] pt-3 md:grid-cols-5 md:gap-4 md:pt-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              characters
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
              {correctChars}
              <span className="mx-1 text-[#646669]">/</span>
              <span className="text-[#ca4754]">{incorrectChars}</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              keystrokes
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
              {totalChars}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              time
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
              {timeElapsed}s
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              raw
            </div>
            <div className="mt-1 text-xl text-[#d1d0c5] md:mt-1.5 md:text-3xl">
              {Math.round(rawWpm)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#646669]">
              errors
            </div>
            <div className="mt-1 text-xl text-[#ca4754] md:mt-1.5 md:text-3xl">
              {incorrectChars}
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col justify-center items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-[#646669] md:gap-4 md:text-xs">
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer transition-colors hover:text-[#e2b714]"
            type="button"
          >
            <RxReload className="size-8" />
          </button>
          <button
            onClick={onRestart}
            className="transition-colors hover:text-[#d1d0c5]"
            type="button"
          >
            back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoloScorePage;
