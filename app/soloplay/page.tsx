import SoloPlayPage from "@/components/soloplay/soloplay-page";
import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "@/components/soloplay/soloplay-constants";
import { SOLO_TEXT_POOL } from "@/components/soloplay/text-pool";
import React from "react";

export const dynamic = "force-dynamic";

const page = ({
  searchParams,
}: {
  searchParams?: { duration?: string };
}) => {
  const rawDuration = Number(searchParams?.duration);
  const initialDuration = SOLO_DURATIONS.includes(
    rawDuration as (typeof SOLO_DURATIONS)[number]
  )
    ? rawDuration
    : DEFAULT_SOLO_DURATION;
  const initialText =
    SOLO_TEXT_POOL[Math.floor(Math.random() * SOLO_TEXT_POOL.length)] ||
    SOLO_TEXT_POOL[0];
  return (
    <div>
      <SoloPlayPage
        initialText={initialText}
        initialDuration={initialDuration}
      />
    </div>
  );
};

export default page;
