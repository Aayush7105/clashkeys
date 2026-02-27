"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GameNavbar from "@/components/game-navbar";
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
    rawDuration as (typeof SOLO_DURATIONS)[number],
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
    <main className="min-h-screen bg-neutral-900 text-neutral-300 flex items-start justify-center px-3 pt-3 md:items-center md:px-2 md:py-16">
      <div className="w-full max-w-7xl min-h-screen py-0 md:h-screen md:py-20">
        <div className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur md:relative md:top-auto md:bg-transparent md:backdrop-blur-none">
          <GameNavbar
            currentDuration={duration}
            durations={SOLO_DURATIONS}
            onDurationChange={handleDurationChange}
          />
        </div>
        <div className="flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a] mt-10 md:px-16 lg:px-32">
          <span className="font-mono text-md ">Solo Play</span>
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
