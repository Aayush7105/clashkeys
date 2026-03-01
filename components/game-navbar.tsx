"use client";

import { Hash, Menu, MessageSquare, Triangle, User, X } from "lucide-react";
import { useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaKeyboard } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import type { SoloMode } from "@/components/soloplay/soloplay-modes";

type GameNavbarProps = {
  currentDuration: number;
  durations: readonly number[];
  onDurationChange: (duration: number) => void;
  currentMode?: SoloMode;
  onModeChange?: (mode: SoloMode) => void;
  canChangeMode?: boolean;
  disabledModeTitle?: string;
  canChangeDuration?: boolean;
  disabledDurationTitle?: string;
};

export default function GameNavbar({
  currentDuration,
  durations,
  onDurationChange,
  currentMode = "words",
  onModeChange,
  canChangeMode = true,
  disabledModeTitle = "Mode is locked",
  canChangeDuration = true,
  disabledDurationTitle = "Duration is locked",
}: GameNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canInteractModes = canChangeMode && typeof onModeChange === "function";

  const handleDurationChange = (duration: number) => {
    if (!canChangeDuration) return;
    onDurationChange(duration);
    setIsMobileMenuOpen(false);
  };

  const handleModeChange = (mode: SoloMode) => {
    if (!canInteractModes || !onModeChange) return;
    onModeChange(mode);
    setIsMobileMenuOpen(false);
  };

  const modeButtonClass = (mode: SoloMode) => {
    const isActive = canInteractModes && currentMode === mode;
    return `flex items-center gap-2 transition px-1 py-0.5 rounded-md ${
      isActive
        ? "text-yellow-500 font-semibold hover:text-yellow-400"
        : "text-neutral-600 hover:text-slate-300"
    } ${!canInteractModes ? "opacity-50 cursor-not-allowed hover:text-neutral-600" : "cursor-pointer"}`;
  };

  const modeItems = (
    <>
      <button
        type="button"
        onClick={() => handleModeChange("punctuation")}
        className={modeButtonClass("punctuation")}
        aria-pressed={canInteractModes && currentMode === "punctuation"}
        disabled={!canInteractModes}
        title={canInteractModes ? "Set mode to punctuation" : disabledModeTitle}
      >
        <AiOutlineExclamationCircle size={16} />
        <span>punctuation</span>
      </button>
      <div className="flex items-center gap-2 cursor-default text-neutral-600/60">
        <Hash size={16} />
        <span>numbers</span>
      </div>
      <button
        type="button"
        onClick={() => handleModeChange("words")}
        className={modeButtonClass("words")}
        aria-pressed={canInteractModes && currentMode === "words"}
        disabled={!canInteractModes}
        title={canInteractModes ? "Set mode to time" : disabledModeTitle}
      >
        <MdOutlineTimer size={16} />
        <span>time</span>
      </button>
      <div className="flex items-center gap-2 cursor-default text-neutral-600/60">
        <MessageSquare size={16} />
        <span>quote</span>
      </div>
      <div className="flex items-center gap-2 cursor-default text-neutral-600/60">
        <Triangle size={16} />
        <span>zen</span>
      </div>
    </>
  );

  const durationButtons = durations.map((duration) => (
    <button
      key={duration}
      onClick={() => handleDurationChange(duration)}
      className={`transition px-2 py-0.5 rounded-md cursor-pointer ${
        currentDuration === duration
          ? "text-yellow-500 font-semibold hover:text-yellow-400"
          : "hover:text-slate-300"
      } ${!canChangeDuration ? "opacity-50 cursor-not-allowed hover:text-slate-500" : ""}`}
      disabled={!canChangeDuration}
      type="button"
      title={canChangeDuration ? `Set duration to ${duration}s` : disabledDurationTitle}
    >
      {duration}
    </button>
  ));

  return (
    <div className="w-full p-2 md:p-2 flex flex-col justify-center items-center gap-2 md:gap-3">
      <div className="flex justify-between lg:px-32 md:px-12 py-2 md:py-4 w-full md:-mt-20">
        <div className="font-mono tracking-widest text-neutral-200">CLASHKEYS</div>
        <div className="flex items-center gap-4 text-slate-400">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden cursor-pointer hover:text-white transition"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <FaKeyboard size={20} className="cursor-default hover:text-white transition" />
          <User size={20} className="cursor-default hover:text-white transition" />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 px-6 py-3 text-sm text-neutral-300 border border-neutral-700 rounded-2xl bg-neutral-900 w-fit">
        <div className="flex items-center gap-6">
          {modeItems}
          <div className="h-full w-0.5 bg-white" />
        </div>

        <div className="flex items-center gap-4 text-slate-500">{durationButtons}</div>
      </div>

      {isMobileMenuOpen && (
        <div className="w-full px-6 md:hidden">
          <div className="flex flex-col gap-4 px-4 py-3 text-sm text-neutral-300 border border-neutral-700 rounded-2xl bg-neutral-900">
            <div className="grid grid-cols-2 gap-3">{modeItems}</div>
            <div className="h-0.5 w-full bg-neutral-700" />
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              {durationButtons}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
