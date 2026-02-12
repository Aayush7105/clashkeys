import SoloPlayPage from "@/components/soloplay/soloplay-page";
import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "@/components/soloplay/soloplay-constants";
import { SOLO_TEXT_POOL } from "@/components/soloplay/text-pool";

export const dynamic = "force-dynamic";

function fetchWithTimeout(url: string, ms = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  return fetch(url, {
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

function cleanText(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitWords(text: string, maxWords: number) {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

function getPoolFallback(): string {
  if (!Array.isArray(SOLO_TEXT_POOL) || SOLO_TEXT_POOL.length === 0) {
    return "";
  }

  const idx = Math.floor(Math.random() * SOLO_TEXT_POOL.length);
  return SOLO_TEXT_POOL[idx] ?? SOLO_TEXT_POOL[0];
}

// same structure you already use
async function getSentence(): Promise<string> {
  async function fetchWiki() {
    const r = await fetchWithTimeout(
      "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      5000,
    );

    if (!r.ok) throw new Error();

    const d = await r.json();
    const extract = d?.extract;

    if (typeof extract !== "string") throw new Error();

    const cleaned = cleanText(extract);

    if (!cleaned) throw new Error();

    const limited = limitWords(cleaned, 40);

    if (limited.split(/\s+/).length < 15) throw new Error();

    return limited;
  }

  try {
    return await fetchWiki();
  } catch {
    try {
      return await fetchWiki();
    } catch {
      return getPoolFallback();
    }
  }
}
export default async function Page({
  searchParams,
}: {
  searchParams?: { duration?: string };
}) {
  const rawDuration = Number(searchParams?.duration);

  const initialDuration = SOLO_DURATIONS.includes(
    rawDuration as (typeof SOLO_DURATIONS)[number],
  )
    ? rawDuration
    : DEFAULT_SOLO_DURATION;

  const initialText = await getSentence();

  return (
    <div>
      <SoloPlayPage
        initialText={initialText}
        initialDuration={initialDuration}
      />
    </div>
  );
}
