"use client";

import { Hash, MessageSquare, Triangle, User } from "lucide-react";
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
  return (
    <div className="w-full p-2 flex flex-col justify-center items-center gap-3">
      <div className="flex justify-between px-6 py-4 w-full">
        <div className="font-mono tracking-widest text-neutral-200">CLASHKEYS</div>
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono">
          Multiplayer
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <FaKeyboard
            size={20}
            className="cursor-default hover:text-white transition"
          />
          <User size={20} className="cursor-default hover:text-white transition" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-6 py-3 text-sm text-neutral-300 border border-neutral-700 rounded-2xl bg-neutral-900 w-fit">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-neutral-600">
            <AiOutlineExclamationCircle size={16} />
            <span>punctuation</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Hash size={16} />
            <span>numbers</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
            <MdOutlineTimer size={16} />
            <span>time</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <span>A</span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <MessageSquare size={16} />
            <span>quote</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Triangle size={16} />
            <span>zen</span>
          </div>
          <div className="h-5 w-px bg-neutral-700" />
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          {MULTIPLAYER_DURATIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => {
                if (!isHost) return;
                onDurationChange(duration);
              }}
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
    </div>
  );
}
