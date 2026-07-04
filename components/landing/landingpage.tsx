import React from "react";
import Link from "next/link";
import Image from "next/image";
import TypingOnce from "../typingonce";
import LandingGraph from "./landing-graph";
import { RiTwitterXLine } from "react-icons/ri";
import { FiGithub } from "react-icons/fi";
import { BsLinkedin } from "react-icons/bs";
const Landing = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none absolute -top-32 right-0 h-104 w-104 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,183,20,0.3),rgba(10,10,10,0))] sm:h-120 sm:w-120" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-128 w-lg rounded-full bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.45),rgba(10,10,10,0))] sm:h-144 sm:w-xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-10 sm:px-6 sm:py-14 lg:py-16">
        <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-neutral-500 sm:text-xs sm:tracking-[0.35em]">
          <div className="flex gap-1 justify-center items-center"> <Image
            src={"/clashkeys.png"}
            alt="sjx"
            height={56}
            width={56}
            className="h-9 rounded-full w-9 p-0.5 object-cover"
          />
            <div className="text-yellow-400 tracking-wide text-xl font-mono font-medium">ClashKeys</div></div>

          <div className="flex gap-3  ">
            <Link
              href={"https://www.linkedin.com/in/aayushrawat7105/"}
              target="_blank"
            >
              <BsLinkedin className="size-5 text-neutral-400 hover:text-neutral-200" />
            </Link>
            <Link href={"https://x.com/AayushRawat715"} target="_blank">
              <RiTwitterXLine className="size-5 text-neutral-400 hover:text-neutral-200" />
            </Link>
            <Link
              href={"https://github.com/Aayush7105/clashkeys"}
              target="_blank"
            >
              <FiGithub className="size-5 text-neutral-400 hover:text-neutral-200" />
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-8 sm:mt-14 sm:gap-10 lg:mt-16 lg:gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-neutral-400 font-mono">

                Competitive typing duels
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight font-mono">
                <TypingOnce text={"ClashKeys"} />
              </h1>
              <p className="max-w-xl text-sm text-neutral-400 sm:text-base lg:text-lg font-mono text-pretty">
                ClashKeys transforms typing into a real-time battle arena.
                Create a room, invite your rivals, and race to the top
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/multiplayer"
                className="w-full rounded-lg bg-[#e2b714] px-3 py-3 text-center text-xl font-bold text-[#1a1b1f] tracking-normal hover:brightness-110 sm:w-auto sm:px-6 font-mono hover:-translate-y-1 transition-all ease-in-out "
              >
                Start a Room
              </Link>
              <Link
                href="/soloplay"
                className="w-full rounded-lg ring ring-neutral-800 px-3 py-3 text-center text-xl font-semibold tracking-wide text-neutral-200 hover:bg-neutral-400/50 sm:w-auto sm:px-6 font-mono hover:-translate-y-1 transition-all ease-in-out"
              >
                Practice Solo
              </Link>
            </div>
          </div>

          <LandingGraph />
        </div>

        <section className="mt-12 grid gap-4 sm:mt-14 sm:gap-6 lg:mt-16 lg:grid-cols-3">
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
              copy: "See your mistakes and accuracy. Improve precision with real-time error highlights.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl ring ring-neutral-800 bg-neutral-900 p-5 font-mono tracking-tighter sm:p-6"
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
