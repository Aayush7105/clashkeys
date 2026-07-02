import SoloPlayPage from "@/components/soloplay/soloplay-page";
import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "@/components/soloplay/soloplay-constants";
import {
  DEFAULT_SOLO_MODE,
  isValidSoloMode,
  type SoloMode,
} from "@/components/soloplay/soloplay-modes";
import {
  CODE_TEXT_POOL,
  NUMBERS_TEXT_POOL,
  PUNCTUATION_TEXT_POOL,
  QUOTE_TEXT_POOL,
  WORDS_TEXT_POOL,
} from "@/components/soloplay/text-pool";

export const dynamic = "force-dynamic";

function fetchWithTimeout(url: string, ms = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  return fetch(url, {
    cache: "no-store",
    signal: controller.signal,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ClashKeys/1.0",
    },
  }).finally(() => clearTimeout(id));
}

function cleanTextForWords(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTextForQuote(text: string) {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^A-Za-z0-9\s.,?!:;'"()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitWords(text: string, maxWords: number) {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

function getPoolFallback(mode: SoloMode): string {
  const pool =
    mode === "punctuation"
      ? PUNCTUATION_TEXT_POOL
      : mode === "numbers"
        ? NUMBERS_TEXT_POOL
        : mode === "quote"
          ? QUOTE_TEXT_POOL
          : mode === "code"
            ? CODE_TEXT_POOL
        : WORDS_TEXT_POOL;

  if (!Array.isArray(pool) || pool.length === 0) {
    return "";
  }

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? pool[0];
}

// same structure you already use
async function getSentence(mode: SoloMode): Promise<string> {
  // Punctuation mode should always use punctuation-ready local pool.
  if (mode === "punctuation") {
    return getPoolFallback("punctuation");
  }
  if (mode === "numbers") {
    return getPoolFallback("numbers");
  }
  if (mode === "quote") {
    async function fetchQuote() {
      const r = await fetchWithTimeout("https://api.quotable.io/random", 2500);
      if (!r.ok) throw new Error();

      const d = await r.json();
      const content = typeof d?.content === "string" ? d.content : "";
      const author = typeof d?.author === "string" ? d.author : "";
      const combined = author ? `${content} - ${author}` : content;
      const cleaned = cleanTextForQuote(combined);

      if (!cleaned) throw new Error();

      const limited = limitWords(cleaned, 45);
      if (limited.split(/\s+/).length < 6) throw new Error();

      return limited;
    }

    try {
      return await fetchQuote();
    } catch {
      return getPoolFallback("quote");
    }
  }
  if (mode === "code") {
    return getPoolFallback("code");
  }

  async function fetchWiki() {
    const r = await fetchWithTimeout(
      "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      2000,
    );

    if (!r.ok) throw new Error();

    const d = await r.json();
    const extract = d?.extract;

    if (typeof extract !== "string") throw new Error();

    const cleaned = cleanTextForWords(extract);

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
      return getPoolFallback("words");
    }
  }
}
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ duration?: string; mode?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const rawDuration = Number(params?.duration);
  const rawMode = params?.mode;
  const mode: SoloMode = isValidSoloMode(rawMode) ? rawMode : DEFAULT_SOLO_MODE;

  const initialDuration = SOLO_DURATIONS.includes(
    rawDuration as (typeof SOLO_DURATIONS)[number],
  )
    ? rawDuration
    : DEFAULT_SOLO_DURATION;

  const initialText = await getSentence(mode);

  return (
    <div>
      <SoloPlayPage
        initialText={initialText}
        initialDuration={initialDuration}
      />
    </div>
  );
}
