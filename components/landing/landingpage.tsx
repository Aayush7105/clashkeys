import React from "react";
import Link from "next/link";
import TypingOnce from "../typingonce";
import LandingGraph from "./landing-graph";

const Landing = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none absolute -top-32 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.3),rgba(10,10,10,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.45),rgba(10,10,10,0))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-neutral-500">
          <span></span>
          <span className="text-[#e2b714]">ClashKeys</span>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Competitive typing duels
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight font-mono">
                <TypingOnce text={"ClashKeys"} />
              </h1>
              <p className="max-w-xl text-base text-neutral-400 sm:text-lg font-mono text-pretty">
                ClashKeys transforms typing into a real-time battle arena.
                Create a room, invite your rivals, and race to the top
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/multiplayer"
                className="rounded-lg bg-[#e2b714] px-6 py-3 text-sm font-semibold text-[#1a1b1f] tracking-wide hover:brightness-110"
              >
                Start a Room
              </Link>
              <Link
                href="/soloplay"
                className="rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold tracking-wide text-neutral-200 hover:border-[#e2b714]"
              >
                Practice Solo
              </Link>
            </div>
          </div>

          <LandingGraph />
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Play with Friends",
              copy: "Compete with friends in live typing races and see who tops the leaderboard.",
            },
            {
              title: "Real-Time Speed Tracking",
              copy: "Track your typing speed live with instant WPM updates as you improve your speed.",
            },
            {
              title: "Accuracy & Smart Error Analysis",
              copy: "See your mistakes and accuracyś  . Improve precision with real-time error highlights.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 font-mono  tracking-tighter"
            >
              <h3 className="text-[16px] font-semibold text-neutral-200">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-400">{card.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default Landing;
