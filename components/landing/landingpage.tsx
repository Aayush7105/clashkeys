import React from "react";
import Link from "next/link";
import TypingOnce from "../typingonce";

const Landing = () => {
  const staticWpmData = [37, 42, 48, 54, 57, 61, 59, 63, 67, 65, 69, 72];
  const minWpm = Math.min(...staticWpmData);
  const maxWpm = Math.max(...staticWpmData);
  const wpmRange = maxWpm - minWpm;
  const maxIndex = Math.max(1, staticWpmData.length - 1);

  const wpmPoints = staticWpmData.map((value, index) => {
    const x = (index / maxIndex) * 100;
    const y =
      wpmRange === 0 ? 50 : 100 - ((value - minWpm) / wpmRange) * 100;
    return { x, y, value };
  });

  const linePoints = wpmPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `0,100 ${linePoints} 100,100`;
  const averageWpm = Math.round(
    staticWpmData.reduce((sum, value) => sum + value, 0) / staticWpmData.length,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#15171c] text-[#e2e2e2]">
      <div className="pointer-events-none absolute -top-32 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.35),rgba(21,23,28,0))]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(49,64,90,0.6),rgba(21,23,28,0))]" />

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
              <span>WPM Preview</span>
              <span className="text-[#e2b714]">#4821</span>
            </div>
            <div className="mt-6 rounded-xl border border-[#2a2d34] bg-[#14161b] p-4">
              <div className="flex items-end justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b6f7a]">
                  Live speed
                </div>
                <div className="text-2xl font-semibold text-[#e2b714]">
                  {staticWpmData[staticWpmData.length - 1]} wpm
                </div>
              </div>

              <div className="mt-4 h-44 w-full">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  {[20, 40, 60, 80].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#2a2d34"
                      strokeWidth="0.6"
                    />
                  ))}
                  <polygon
                    points={areaPoints}
                    fill="#e2b714"
                    fillOpacity="0.08"
                  />
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke="#e2b714"
                    strokeWidth="1.7"
                  />
                  {wpmPoints.map((point, index) => (
                    <circle
                      key={`${point.value}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="1.5"
                      fill="#e2b714"
                    />
                  ))}
                </svg>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#6b6f7a]">
                <span>0s</span>
                <span>6s</span>
                <span>12s</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.14em] text-[#6b6f7a]">
                <div className="rounded-lg border border-[#2a2d34] bg-[#181b21] px-3 py-2">
                  avg: <span className="text-[#e2e2e2]">{averageWpm}</span>
                </div>
                <div className="rounded-lg border border-[#2a2d34] bg-[#181b21] px-3 py-2">
                  peak: <span className="text-[#e2e2e2]">{maxWpm}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-[#2a2d34] p-4 text-center text-xs text-[#6b6f7a] uppercase tracking-[0.2em]">
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
