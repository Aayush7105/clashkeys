import SoloPlayPage from "@/components/soloplay/soloplay-page";
import { SOLO_TEXT_POOL } from "@/components/soloplay/text-pool";
import React from "react";

export const dynamic = "force-dynamic";

const page = () => {
  const initialText =
    SOLO_TEXT_POOL[Math.floor(Math.random() * SOLO_TEXT_POOL.length)] ||
    SOLO_TEXT_POOL[0];
  return (
    <div>
      <SoloPlayPage initialText={initialText} />
    </div>
  );
};

export default page;
