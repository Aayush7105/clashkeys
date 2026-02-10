"use client";

import React, { useState } from "react";
import Solonavbar from "./solonavbar";
import SoloTypingArea from "./solotypingarea";

const SoloPlayPage: React.FC = () => {
  const [duration, setDuration] = useState(30);

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 flex items-center justify-center px-2 py-16">
      <div className="max-w-7xl h-screen py-20">
        <div className="relative z-50">
          <Solonavbar
            currentDuration={duration}
            onDurationChange={setDuration}
          />
        </div>
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a] mt-10">
          <span className="font-mono text-md">Solo Play</span>
        </div>
        {/* Reset component completely when duration changes */}
        <SoloTypingArea key={duration} duration={duration} />
      </div>
    </main>
  );
};

export default SoloPlayPage;
