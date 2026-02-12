"use client";

import { User, Hash, MessageSquare, Triangle } from "lucide-react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaKeyboard } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { SOLO_DURATIONS } from "./soloplay-constants";

interface SoloNavbarProps {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
}

export default function SoloNavbar({
  currentDuration,
  onDurationChange,
}: SoloNavbarProps) {
  const durations = SOLO_DURATIONS;

  return (
    <div className="w-ful p-2 flex flex-col justify-center items-center gap-3">
      <div className="flex  justify-between px-6 py-4 w-full -mt-20">
        <div className="font-mono tracking-widest text-neutral-200">
          CLASHKEYS
        </div>
        <div className="flex items-center gap-4 text-slate-400"></div>
        <div className="flex items-center gap-4 text-slate-400">
          <FaKeyboard
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
          <User
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 px-6 py-3 text-sm text-neutral-300 border border-neutral-600 rounded-2xl bg-neutral-900 w-fit">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <AiOutlineExclamationCircle size={16} />
            <span>punctuation</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <Hash size={16} />
            <span>numbers</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition text-yellow-500">
            <MdOutlineTimer size={16} />
            <span>time</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <span>A</span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <MessageSquare size={16} />
            <span>quote</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <Triangle size={16} />
            <span>zen</span>
          </div>
          <div className="h-full w-0.5 bg-white"> </div>
        </div>

        {/* Duration Options - Logic added here */}
        <div className="flex items-center gap-4 text-slate-500">
          {durations.map((d) => (
            <span
              key={d}
              onClick={() => onDurationChange(d)}
              className={`cursor-pointer transition px-2 py-0.5 rounded-md  ${
                currentDuration === d
                  ? "text-yellow-500 font-semibold hover:text-yellow-400"
                  : "hover:text-slate-300"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
