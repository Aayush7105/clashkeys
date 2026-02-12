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
  wpmHistory,
}) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-neutral-950 overflow-y-auto min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="text-neutral-500 font-mono mb-8 uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Test Completed
        </div>

        {/* Huge Stats Section */}
        <div className="mt-8 w-full max-w-xl">
          <WpmGraph data={wpmHistory} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 w-full max-w-4xl">
          <div className="text-center md:text-left">
            <div className="text-neutral-500 font-mono text-sm mb-2">wpm</div>
            <div className="text-md md:text-md font-bold text-yellow-500 font-mono leading-none tracking-tighter">
              {Math.round(wpm)}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-neutral-500 font-mono text-xl mb-2">acc</div>
            <div className="text-md md:text-md font-bold text-neutral-200 font-mono leading-none tracking-tighter">
              {Math.round(accuracy)}%
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-800 pt-12 w-full max-w-4xl mb-16">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> characters
            </span>
            <span className="text-3xl font-mono text-neutral-200">
              {correctChars}
              <span className="text-neutral-600">/</span>
              <span className="text-red-500">{incorrectChars}</span>
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2 flex items-center gap-2">
              <Target className="w-3 h-3" /> keystrokes
            </span>
            <span className="text-3xl font-mono text-neutral-200">
              {totalChars}
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2">
              time
            </span>
            <span className="text-3xl font-mono text-neutral-200">
              {timeElapsed}s
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs uppercase text-neutral-500 font-mono mb-2">
              raw
            </span>
            <span className="text-3xl font-mono text-neutral-400">
              {Math.round(rawWpm)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <button
            onClick={() => window.location.reload()}
            className="text-neutral-500 hover:text-neutral-200 font-mono text-sm uppercase tracking-widest transition-colors"
          >
            <TbReload className="size-8 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoloScorePage;
