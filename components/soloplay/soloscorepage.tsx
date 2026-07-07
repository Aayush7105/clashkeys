import React, { useEffect } from "react";
import WpmGraph from "./wpmgraph";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiLoopLeftLine } from "react-icons/ri";

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
      <div className="pointer-events-none absolute -top-36 right-0 z-0 h-112 w-md rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.22)_0%,rgba(226,183,20,0.1)_42%,rgba(10,10,10,0)_74%)] blur-3xl sm:h-128 sm:w-lg" />
      <div className="pointer-events-none absolute -bottom-32 left-0 z-0 h-136 w-xl rounded-full bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.34)_0%,rgba(64,64,64,0.16)_44%,rgba(10,10,10,0)_76%)] blur-3xl sm:h-152 sm:w-2xl" />

      <div className="relative z-10 mx-auto flex min-h-screen lg:h-screen lg:min-h-0 lg:max-h-screen w-full max-w-7xl flex-col justify-start lg:justify-start gap-2 lg:gap-2.5 px-3 py-4 lg:py-6 font-mono lg:overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <p className="text-2xl font-semibold uppercase tracking-normal text-neutral-400 md:text-3xl">
            Test completed
            <br />
            <span className="text-lg tracking-normal md:text-xl">solo play</span>
          </p>
        </div>

        <section className="flex w-full flex-col gap-2 md:gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-4 md:gap-6 lg:w-[15%] lg:flex-col lg:gap-3">
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500">
                wpm
              </div>
              <div className="text-3xl font-semibold leading-none text-[#e2b714] md:text-7xl">
                {Math.round(wpm)}
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500">
                acc
              </div>
              <div
                className={`text-3xl font-semibold leading-none md:text-7xl ${accuracyColor}`}
              >
                {Math.round(accuracy)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500">
                Duration
              </div>
              <div
                className={`text-3xl font-semibold leading-none md:text-7xl ${accuracyColor}`}
              >
                {selectedDuration}
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
              heightClass="h-[clamp(8rem,18vh,12rem)] w-full md:h-[clamp(10rem,22vh,15rem)]"
            />
          </div>
        </section>

        <section className="mt-1 w-full pt-1">
          <div className="flex items-center justify-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => window.location.reload()}
                    className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-[#e2b714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2b714]"
                    type="button"
                    aria-label="restart test"
                  >
                    <RiLoopLeftLine className="size-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">restart test</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              onClick={onRestart}
              className="bg-[#e2b714] ring px-2.5 py-1 rounded-xl text-center text-xs font-semibold uppercase tracking-normal text-neutral-950 transition-colors hover:bg-amber-300/90 cursor-pointer"
              type="button"
            >
              go back
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-neutral-950 ring ring-neutral-900 font-mono">
          <div className="flex flex-col gap-1.5 border-b border-neutral-900 bg-neutral-950 px-5 py-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#646669]">
                score breakdown
              </p>
              <h2 className="mt-0.5 text-2xl font-semibold leading-none text-[#d1d0c5] sm:text-3xl">
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

          <div className="grid grid-cols-2 divide-x divide-y divide-neutral-900 md:grid-cols-4 md:divide-y-0">
            <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#646669]">
                Characters
              </p>

              <p className="mt-2 text-3xl font-semibold text-[#d1d0c5] tabular-nums">
                {correctChars}
              </p>

              <p className="mt-1.5 text-sm font-semibold tabular-nums">
                <span className="text-[#d1d0c5]">{correctChars}</span>
                <span className="mx-1 text-[#646669]">/</span>
                <span className="text-[#ca4754]">{incorrectChars}</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#646669]">
                Keystrokes
              </p>

              <p className="mt-2 text-3xl font-semibold text-emerald-500 tabular-nums">
                {correctChars}
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#d1d0c5] tabular-nums">
                {totalChars} Correct
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#646669]">
                Raw Speed
              </p>

              <p className="mt-2 text-3xl font-semibold text-[#d1d0c5] tabular-nums">
                {Math.round(rawWpm)}
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#8f949e]">
                WPM
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#646669]">
                Errors
              </p>

              <p className="mt-2 text-3xl font-semibold text-[#ca4754] tabular-nums">
                {incorrectChars}
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#8f949e]">
                {Math.round(accuracy)}% ACC
              </p>
            </div>
          </div>
        </section>





      </div>
    </div>
  );
};

export default SoloScorePage;
