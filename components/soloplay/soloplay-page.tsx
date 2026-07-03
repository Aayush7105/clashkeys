"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GameNavbar from "@/components/game-navbar";
import SoloTypingArea from "./solotypingarea";
import { DEFAULT_SOLO_DURATION, SOLO_DURATIONS } from "./soloplay-constants";
import {
  DEFAULT_SOLO_MODE,
  isValidSoloMode,
  type SoloMode,
} from "./soloplay-modes";

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
  const rawMode = searchParams.get("mode");
  const duration = SOLO_DURATIONS.includes(
    rawDuration as (typeof SOLO_DURATIONS)[number],
  )
    ? rawDuration
    : initialDuration || DEFAULT_SOLO_DURATION;
  const mode: SoloMode = isValidSoloMode(rawMode) ? rawMode : DEFAULT_SOLO_MODE;

  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    setHasStartedTyping(false);
    setShowUI(true);
  }, [duration, mode]);

  useEffect(() => {
    if (!hasStartedTyping) {
      setShowUI(true);
      return;
    }

    setShowUI(false);

    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowUI(false);
      }, 2500);
    };

    const handleKeyDown = () => {
      setShowUI(false);
      clearTimeout(timeoutId);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [hasStartedTyping]);


  const handleDurationChange = (next: number) => {
    if (next === duration) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", String(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleModeChange = (nextMode: SoloMode) => {
    if (nextMode === mode) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", nextMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className={`min-h-screen bg-neutral-900 text-neutral-300 flex items-center justify-center px-3 md:px-2 transition-all duration-300 ${!showUI ? "cursor-none" : ""}`}>
      <div className="w-full max-w-7xl min-h-screen relative flex flex-col justify-center py-20">
        <div className={`transition-all duration-500 ease-in-out absolute top-4 md:top-26 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur md:bg-transparent md:backdrop-blur-none ${
          showUI
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}>
          <GameNavbar
            currentDuration={duration}
            durations={SOLO_DURATIONS}
            onDurationChange={handleDurationChange}
            currentMode={mode}
            onModeChange={handleModeChange}
          />
        </div>
        {/* Reset component completely when duration changes */}
        <div className={`transition-all duration-500 ease-in-out w-full transform ${
          showUI ? "mt-16 md:mt-24 translate-y-0" : "mt-0 md:mt-0 -translate-y-6 md:-translate-y-10"
        }`}>
          <div className={`transition-all duration-500 ease-in-out flex items-center justify-between text-sm tracking-[0.2em] uppercase text-[#6b6f7a] md:px-16 lg:px-32 mb-1 ${
            showUI
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}>
            <span className="font-mono text-xl">Solo Play</span>
          </div>
          <SoloTypingArea
            key={`${duration}-${mode}`}
            duration={duration}
            initialText={initialText}
            mode={mode}
            onTypingStateChange={setHasStartedTyping}
          />
        </div>
      </div>
    </main>
  );
};

export default SoloPlayPage;
