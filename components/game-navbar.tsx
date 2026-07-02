"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Hash, Menu, MessageSquare, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaCode, FaKeyboard } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import type { SoloMode } from "@/components/soloplay/soloplay-modes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

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

  const navTooltip = (content: string, children: ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>{content}</TooltipContent>
    </Tooltip>
  );

  const modeButtonClass = (mode: SoloMode) => {
    const isActive = canInteractModes && currentMode === mode;
    return `relative isolate flex items-center gap-1 rounded-full px-2 py-1.5 transition ${isActive
      ? "text-neutral-900 font-bold hover:text-neutral-800"
      : "text-neutral-400 hover:text-slate-300"
      } ${!canInteractModes ? "cursor-not-allowed opacity-50 hover:text-neutral-400" : "cursor-pointer"}`;
  };

  const modeItems = [
    {
      mode: "punctuation" as const,
      label: "punctuation",
      icon: <AiOutlineExclamationCircle size={16} />,
    },
    { mode: "numbers" as const, label: "numbers", icon: <Hash size={16} /> },
    {
      mode: "quote" as const,
      label: "quote",
      icon: <MessageSquare size={16} />,
    },
    { mode: "code" as const, label: "code", icon: <FaCode size={16} /> },
    {
      mode: "words" as const,
      label: "time",
      icon: <MdOutlineTimer size={16} />,
    },
  ];

  const renderModeItems = (layoutScope: string) =>
    modeItems.map(({ mode, label, icon }) => (
      <span key={mode} className="inline-flex">
        {navTooltip(
          canInteractModes ? `set mode to ${label}` : disabledModeTitle,
          <span className="inline-flex">
            <button
              type="button"
              onClick={() => handleModeChange(mode)}
              className={modeButtonClass(mode)}
              aria-pressed={canInteractModes && currentMode === mode}
              disabled={!canInteractModes}
            >
              {canInteractModes && currentMode === mode && (
                <motion.span
                  layoutId={`${layoutScope}-mode-selected-pill`}
                  className="absolute inset-0 rounded-full bg-yellow-400"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                {icon}
                <span>{label}</span>
              </span>
            </button>
          </span>,
        )}
      </span>
    ));

  const renderDurationButtons = (layoutScope: string) =>
    durations.map((duration) => (
      <span key={duration} className="inline-flex">
        {navTooltip(
          canChangeDuration
            ? `set duration to ${duration}s`
            : disabledDurationTitle,
          <span className="inline-flex">
            <button
              onClick={() => handleDurationChange(duration)}
              className={`relative isolate rounded-full px-2 py-1.5 transition ${currentDuration === duration
                ? "text-neutral-900 font-bold hover:text-neutral-800"
                : "text-neutral-300 hover:text-slate-300"
                } ${!canChangeDuration ? "cursor-not-allowed opacity-50 hover:text-neutral-300" : "cursor-pointer"}`}
              disabled={!canChangeDuration}
              type="button"
            >
              {currentDuration === duration && (
                <motion.span
                  layoutId={`${layoutScope}-duration-selected-pill`}
                  className="absolute inset-0 rounded-full ring ring-yellow-400 bg-yellow-400"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{duration}</span>
            </button>
          </span>,
        )}
      </span>
    ));

  return (
    <TooltipProvider>
      <div className="w-full p-2 md:p-2 flex flex-col justify-center items-center gap-2 md:gap-3 font-mono">
        <div className="flex justify-between lg:px-32 md:px-12 py-2 md:py-4 w-full md:-mt-20">
          <Link href="/landing" className="font-mono font-semibold tracking-tight text-neutral-400 text-2xl">
            CLASHKEYS
          </Link>
          <div className="flex items-center gap-4 text-neutral-400">
            {navTooltip(
              isMobileMenuOpen ? "close menu" : "open menu",
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="md:hidden cursor-pointer hover:text-white transition"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>,
            )}
            {navTooltip(
              "keyboard",
              <span className="inline-flex cursor-default hover:text-white transition">
                <FaKeyboard size={20} />
              </span>,
            )}
            {navTooltip(
              "profile",
              <span className="inline-flex cursor-default hover:text-white transition">
                <User size={20} />
              </span>,
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 px-6 py-3 text-sm md:text-neutral-400 ring-2 ring-neutral-900 rounded-2xl bg-neutral-900 w-fit">
          <LayoutGroup id="desktop-mode">
            <div className="flex items-center gap-6">
              {renderModeItems("desktop")}
            </div>
          </LayoutGroup>

          <LayoutGroup id="desktop-duration">
            <div className="flex items-center gap-4 text-neutral-400">
              {renderDurationButtons("desktop")}
            </div>
          </LayoutGroup>
        </div>

        {isMobileMenuOpen && (
          <div className="w-full px-6 md:hidden">
            <div className="flex flex-col gap-4 px-4 py-3 text-sm text-neutral-400 ring ring-neutral-700 rounded-2xl bg-neutral-900">
              <LayoutGroup id="mobile-mode">
                <div className="grid grid-cols-2 gap-3">
                  {renderModeItems("mobile")}
                </div>
              </LayoutGroup>
              <div className="h-0.5 w-full bg-neutral-700" />
              <LayoutGroup id="mobile-duration">
                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  {renderDurationButtons("mobile")}
                </div>
              </LayoutGroup>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
