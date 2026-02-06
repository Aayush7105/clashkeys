"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex justify-center items-center flex-col">
      <h1>ClashKeys</h1>
      <div className="flex gap-5">
        <button onClick={() => router.push("/multiplayer")}>
          Play with Friends
        </button>
        <button onClick={() => router.push("/soloplay")}>Practice now</button>
      </div>
    </div>
  );
};

export default Landing;
