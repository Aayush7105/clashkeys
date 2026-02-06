"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex justify-center items-center flex-col gap-5">
      <h1 className="text-4xl">ClashKeys</h1>
      <div className="flex gap-10">
        <button
          onClick={() => router.push("/multiplayer")}
          className="border px-2 py-1 rounded-xl"
        >
          Play with Friends
        </button>
        <button
          onClick={() => router.push("/soloplay")}
          className="border px-2 py-1 rounded-xl"
        >
          Practice now
        </button>
      </div>
    </div>
  );
};

export default Landing;
