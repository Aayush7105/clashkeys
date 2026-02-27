"use client";

import { Hash, Menu, MessageSquare, Triangle, User, X } from "lucide-react";
import { useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaKeyboard } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { MULTIPLAYER_DURATIONS } from "./multiplayer-constants";

type MultiplayerNavbarProps = {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
  isHost: boolean;
};

export default function MultiplayerNavbar({
  currentDuration,
  onDurationChange,
  isHost,
}: MultiplayerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDurationChange = (duration: number) => {
    if (!isHost) return;
    onDurationChange(duration);
    setIsMobileMenuOpen(false);
  };

  const modeItems = (
    <>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-neutral-600">
        <AiOutlineExclamationCircle size={16} />
        <span>punctuation</span>
      </div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-neutral-600">
        <Hash size={16} />
        <span>numbers</span>
      </div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-yellow-500">
        <MdOutlineTimer size={16} />
        <span>time</span>
      </div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-neutral-600">
        <span>A</span>
        <span>words</span>
      </div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-neutral-600">
        <MessageSquare size={16} />
        <span>quote</span>
      </div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-neutral-600">
        <Triangle size={16} />
        <span>zen</span>
      </div>
    </>
  );

  return (
    <div className="w-full p-1 md:p-2 flex flex-col justify-center items-center gap-1 md:gap-3">
      <div className="flex justify-between lg:px-32 md:px-12 py-1 md:py-4 w-full md:-mt-20">
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
          <FaKeyboard
            size={20}
            className="cursor-default hover:text-white transition"
          />
          <User size={20} className="cursor-default hover:text-white transition" />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 px-6 py-3 text-sm text-neutral-300 border border-neutral-700 rounded-2xl bg-neutral-900 w-fit">
        <div className="flex items-center gap-6">
          {modeItems}
          <div className="h-full w-0.5 bg-white" />
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          {MULTIPLAYER_DURATIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => handleDurationChange(duration)}
              className={`transition px-2 py-0.5 rounded-md cursor-pointer ${
                currentDuration === duration
                  ? "text-yellow-500 font-semibold hover:text-yellow-400"
                  : "hover:text-slate-300"
              } ${!isHost ? "opacity-50 cursor-not-allowed hover:text-slate-500" : ""}`}
              disabled={!isHost}
              type="button"
              title={isHost ? `Set duration to ${duration}s` : "Host controls duration"}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="w-full px-6 md:hidden">
          <div className="flex flex-col gap-4 px-4 py-3 text-sm text-neutral-300 border border-neutral-700 rounded-2xl bg-neutral-900">
            <div className="grid grid-cols-2 gap-3">{modeItems}</div>
            <div className="h-0.5 w-full bg-neutral-700" />
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              {MULTIPLAYER_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => handleDurationChange(duration)}
                  className={`transition px-2 py-0.5 rounded-md cursor-pointer ${
                    currentDuration === duration
                      ? "text-yellow-500 font-semibold hover:text-yellow-400"
                      : "hover:text-slate-300"
                  } ${!isHost ? "opacity-50 cursor-not-allowed hover:text-slate-500" : ""}`}
                  disabled={!isHost}
                  type="button"
                  title={
                    isHost
                      ? `Set duration to ${duration}s`
                      : "Host controls duration"
                  }
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
