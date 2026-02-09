"use client";

import {
  Bell,
  User,
  Keyboard,
  Crown,
  Info,
  Settings,
  AlertCircle,
  Hash,
  Clock,
  MessageSquare,
  Triangle,
  Wrench,
  X,
} from "lucide-react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaKeyboard } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";

export default function SoloNavbar() {
  return (
    <div className="w-ful p-2">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-4  ">
        {/* Left Section - Logo and Brand */}

        {/* Center Navigation Icons */}
        <div className="flex items-center gap-4 text-slate-400"></div>

        {/* Right Section - User Controls */}
        <div className="flex items-center gap-4 text-slate-400">
          <FaKeyboard
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
          <Bell
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
          <User
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
        </div>
      </div>

      {/* Test Options Bar */}
      <div className="flex items-center gap-6 px-6 py-3 text-sm text-neutral-300 border border-neutral-600 rounded-2xl mt-5 bg-neutral-900">
        {/* Test Mode Options */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <AiOutlineExclamationCircle size={16} />
            <span>punctuation</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <Hash size={16} />
            <span>numbers</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
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
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition">
            <Wrench size={16} />
            <span>custom</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-700"></div>

        {/* Duration Options */}
        <div className="flex items-center gap-4 text-slate-500">
          <span className="cursor-pointer hover:text-slate-300 transition">
            15
          </span>
          <span className="text-yellow-500 cursor-pointer font-semibold hover:text-yellow-400 transition">
            30
          </span>
          <span className="cursor-pointer hover:text-slate-300 transition">
            60
          </span>
          <span className="cursor-pointer hover:text-slate-300 transition">
            120
          </span>
        </div>

        {/* Close/Reset Button */}
        <div className="ml-auto">
          <X
            size={18}
            className="text-slate-500 cursor-pointer hover:text-white transition"
          />
        </div>
      </div>
    </div>
  );
}
