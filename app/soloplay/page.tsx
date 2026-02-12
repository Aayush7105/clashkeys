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

function limitWords(text: string, maxWords: number) {
  return text.trim().split(/\s+/).slice(0, maxWords).join(" ");
}

// same format as your previous code
async function getSentence(): Promise<string> {
  const bacon = fetchWithTimeout(
    "https://baconipsum.com/api/?type=meat-and-filler&sentences=4",
    2000,
  ).then(async (r) => {
    if (!r.ok) throw new Error();

    const data = await r.json();

    // API returns string[]
    if (!Array.isArray(data) || typeof data[0] !== "string") {
      throw new Error();
    }

    const text = data.join(" ").replace(/\s+/g, " ").trim();

    // hard limit → max 40 words
    return limitWords(text, 40);
  });

  try {
    // keep the same Promise.any pattern
    return await Promise.any([bacon]);
  } catch {
    return "Typing short paragraphs helps you improve accuracy and reading flow at the same time.";
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
