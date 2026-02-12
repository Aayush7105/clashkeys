import SoloPlayPage from "@/components/soloplay/soloplay-page";
import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "@/components/soloplay/soloplay-constants";

export const dynamic = "force-dynamic";

function fetchWithTimeout(url: string, ms = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  return fetch(url, {
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

// keep only letters and spaces
function cleanText(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// limit words (optional but good for typing)
function limitWords(text: string, maxWords: number) {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

// same structure you already use
async function getSentence(): Promise<string> {
  async function fetchWiki() {
    const r = await fetchWithTimeout(
      "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      2000,
    );

    if (!r.ok) throw new Error();

    const d = await r.json();
    const extract = d?.extract;

    if (typeof extract !== "string") throw new Error();

    const cleaned = cleanText(extract);

    if (!cleaned) throw new Error();

    const limited = limitWords(cleaned, 40);

    // avoid very tiny results
    if (limited.split(/\s+/).length < 15) throw new Error();

    return limited;
  }

  try {
    return await fetchWiki();
  } catch {
    try {
      // retry once
      return await fetchWiki();
    } catch {
      return "Typing practice helps you build focus speed and accuracy through clear meaningful text";
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
