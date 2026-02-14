import React, { useEffect } from "react";
import { Trophy, Zap, Target } from "lucide-react";
import { TbReload } from "react-icons/tb";
import WpmGraph from "./wpmgraph";

interface Props {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
  onRestart: () => void;
  wpmHistory: number[];
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
  wpmHistory,
}) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const accuracyColor =
    accuracy >= 95
      ? "text-emerald-400"
      : accuracy >= 90
        ? "text-amber-400"
        : "text-orange-400";

  return (
    <div className="fixed inset-0 z-100 bg-neutral-950 overflow-y-auto min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl flex flex-col items-center space-y-12">
        {/* Header Indicator */}
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] animate-in slide-in-from-top duration-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Test Completed</span>
        </div>

        {/* Top Section: Main Stats and Graph */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Large Metrics */}
          <div className="lg:col-span-1 space-y-8 flex flex-col items-center lg:items-start">
            <div className="animate-in slide-in-from-left duration-700 delay-100">
              <div className="text-neutral-500 font-mono text-xl mb-1">wpm</div>
              <div className="text-7xl md:text-8xl font-bold text-yellow-500 font-mono leading-none tracking-tighter">
                {Math.round(wpm)}
              </div>
            </div>
            <div className="animate-in slide-in-from-left duration-700 delay-200">
              <div className="text-neutral-500 font-mono text-xl mb-1">acc</div>
              <div
                className={`text-7xl md:text-8xl font-bold font-mono leading-none tracking-tighter ${accuracyColor}`}
              >
                {Math.round(accuracy)}%
              </div>
            </div>
          </div>

          {/* Graph Area */}
          <div className="lg:col-span-3 w-full bg-neutral-900/20 rounded-xl p-4 animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="h-62.5 w-full">
              <WpmGraph data={wpmHistory} />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-neutral-900 pt-12 w-full max-w-4xl animate-in slide-in-from-bottom duration-700 delay-500">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2 tracking-widest">
              <Zap className="w-3 h-3 text-blue-400" /> characters
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {correctChars}
              <span className="text-neutral-700 mx-1">/</span>
              <span className="text-red-500/80">{incorrectChars}</span>
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2 tracking-widest">
              <Target className="w-3 h-3 text-purple-400" /> keystrokes
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {totalChars}
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 tracking-widest">
              time
            </span>
            <span className="text-4xl font-mono text-neutral-200">
              {timeElapsed}s
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 tracking-widest">
              raw wpm
            </span>
            <span className="text-4xl font-mono text-neutral-500">
              {Math.round(rawWpm)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-8 pt-4 animate-in fade-in duration-1000 delay-700">
          <button
            onClick={() => window.location.reload()}
            className="group flex flex-col items-center gap-3 transition-all"
            title="Restart Test"
          >
            <TbReload className="size-10 text-neutral-600 group-hover:text-yellow-500 transition-colors cursor-pointer" />
            <span className="text-neutral-600 group-hover:text-neutral-400 font-mono text-xs uppercase tracking-widest">
              Restart Test
            </span>
          </button>

          <button
            onClick={onRestart}
            className="text-neutral-700 hover:text-neutral-400 font-mono text-xs uppercase tracking-[0.3em] transition-colors"
          >
            back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoloScorePage;
