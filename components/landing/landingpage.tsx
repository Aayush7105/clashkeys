import React from "react";
import Link from "next/link";
import TypingOnce from "../typingonce";

const Landing = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#15171c] text-[#e2e2e2]">
      <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.35),rgba(21,23,28,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(49,64,90,0.6),rgba(21,23,28,0))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#6b6f7a]">
          <span></span>
          <span className="text-[#e2b714]">ClashKeys</span>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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

          <div className="rounded-2xl border border-[#2a2d34] bg-[#1a1d23] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#6b6f7a]">
              <span>Live Room</span>
              <span className="text-[#e2b714]">#4821</span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { name: "Nova", role: "Host", progress: 72 },
                { name: "Kael", role: "Player", progress: 58 },
                { name: "Rin", role: "Player", progress: 41 },
              ].map((player) => (
                <div
                  key={player.name}
                  className="rounded-lg border border-[#2a2d34] bg-[#14161b] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#e2e2e2]">
                        {player.name}
                      </div>
                      <div className="text-xs text-[#6b6f7a]">
                        {player.role}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b6f7a]">
                      {player.progress}%
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-[#20242c]">
                    <div
                      className="h-2 rounded-full bg-[#e2b714]"
                      style={{ width: `${player.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-[#2a2d34] p-4 text-center text-xs text-[#6b6f7a] uppercase tracking-[0.2em]">
              Waiting for players
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
