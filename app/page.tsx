"use client";

import Landing from "@/components/landing/landingpage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main>
      {/* <button onClick={() => router.push("/multiplayer")}>Multiplayer</button>
      <button onClick={() => router.push("/soloplay")}>Solo Play</button> */}
      <Landing />
    </main>
  );
}
