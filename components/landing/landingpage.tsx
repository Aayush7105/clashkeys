import React from "react";
import Link from "next/link";
import TypingOnce from "../typingonce";
import WpmGraph from "../soloplay/wpmgraph";

const Landing = () => {
  const staticWpmData = [37, 42, 48, 54, 57, 61, 59, 63, 67, 65, 69, 72, 74, 73, 76, 78];
  const staticRawWpmData = [40, 45, 51, 57, 61, 65, 63, 68, 71, 69, 73, 76, 77, 76, 79, 82];
  const staticBurstWpmData = [44, 50, 56, 62, 66, 72, 64, 75, 79, 74, 81, 84, 83, 82, 86, 89];
  const staticErrorPoints = [
    { second: 2, wpm: 48 },
    { second: 6, wpm: 59 },
    { second: 9, wpm: 65 },
    { second: 13, wpm: 73 },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#15171c] text-[#e2e2e2]">
      <div className="pointer-events-none absolute -top-32 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.35),rgba(21,23,28,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(49,64,90,0.6),rgba(21,23,28,0))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#6b6f7a]">
          <span></span>
          <span className="text-[#e2b714]">ClashKeys</span>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7f8a]">
                Competitive typing duels
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight font-mono">
                <TypingOnce text={"ClashKeys"} />
              </h1>
              <p className="text-base sm:text-lg text-[#a8adb7] max-w-xl">
                ClashKeys turns typing practice into a head-to-head arena.
                Create a room, invite players, and launch a real-time race. Or
                warm up solo before the next showdown.
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
                className="rounded-lg border border-[#3a3f49] px-6 py-3 text-sm font-semibold tracking-wide text-[#e2e2e2] hover:border-[#e2b714]"
              >
                Practice Solo
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Live Rooms", value: "Real-time races" },
                { label: "Focus Mode", value: "Distraction-free" },
                { label: "Instant Join", value: "4-digit codes" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#2a2d34] bg-[#1b1e24] p-4"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-[#6b6f7a]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#e2e2e2]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.25em] text-[#6b6f7a]">
              <span>WPM Preview</span>
              <span className="text-[#e2b714]">Static Data</span>
            </div>
            <WpmGraph
              wpmData={staticWpmData}
              rawWpmData={staticRawWpmData}
              burstWpmData={staticBurstWpmData}
              errorPoints={staticErrorPoints}
              durationSeconds={15}
            />
            <div className="rounded-xl border border-dashed border-[#2a2d34] p-4 text-center text-xs uppercase tracking-[0.2em] text-[#6b6f7a]">
              Static sample data
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Race-ready UI",
              copy: "Crisp, high-contrast visuals keep focus on speed.",
            },
            {
              title: "Host control",
              copy: "Hosts launch races when everyone is locked in.",
            },
            {
              title: "Solo warmup",
              copy: "Polish accuracy before you enter the arena.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#2a2d34] bg-[#1b1e24] p-6"
            >
              <h3 className="text-lg font-semibold text-[#e2e2e2]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-[#a8adb7]">{card.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default Landing;
