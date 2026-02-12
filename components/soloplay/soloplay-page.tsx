"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Solonavbar from "./solonavbar";
import SoloTypingArea from "./solotypingarea";
import { DEFAULT_SOLO_DURATION, SOLO_DURATIONS } from "./soloplay-constants";

interface SoloPlayPageProps {
  initialText: string;
  initialDuration: number;
}

const SoloPlayPage: React.FC<SoloPlayPageProps> = ({
  initialText,
  initialDuration,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const rawDuration = Number(searchParams.get("duration"));
  const duration = SOLO_DURATIONS.includes(
    rawDuration as (typeof SOLO_DURATIONS)[number]
  )
    ? rawDuration
    : initialDuration || DEFAULT_SOLO_DURATION;

  const handleDurationChange = (next: number) => {
    if (next === duration) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", String(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 flex items-center justify-center px-2 py-16">
      <div className="max-w-7xl h-screen py-20">
        <div className="relative z-50">
          <Solonavbar
            currentDuration={duration}
            onDurationChange={handleDurationChange}
          />
        </div>
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a] mt-10">
          <span className="font-mono text-md">Solo Play</span>
        </div>
        {/* Reset component completely when duration changes */}
        <SoloTypingArea
          key={duration}
          duration={duration}
          initialText={initialText}
        />
      </div>
    </main>
  );
};

export default SoloPlayPage;
