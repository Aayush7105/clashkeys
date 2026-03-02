import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "../soloplay/soloplay-constants";
import {
  CODE_TEXT_POOL,
  NUMBERS_TEXT_POOL,
  PUNCTUATION_TEXT_POOL,
  QUOTE_TEXT_POOL,
  WORDS_TEXT_POOL,
} from "../soloplay/text-pool";
import {
  DEFAULT_SOLO_MODE,
  isValidSoloMode,
  type SoloMode,
} from "../soloplay/soloplay-modes";

export const MULTIPLAYER_DURATIONS = SOLO_DURATIONS;
export const DEFAULT_MULTIPLAYER_DURATION = DEFAULT_SOLO_DURATION;
export const DEFAULT_MULTIPLAYER_MODE = DEFAULT_SOLO_MODE;

function sanitizeTextByMode(text: string, mode: SoloMode) {
  if (mode === "punctuation") {
    return text
      .toLowerCase()
      .replace(/[^a-z\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (mode === "numbers") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.,:%/-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (mode === "quote") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mode === "code") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.,?!:;'"(){}\[\]<>_=+\-*/%`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isValidMultiplayerDuration(
  value: number,
): value is (typeof MULTIPLAYER_DURATIONS)[number] {
  return MULTIPLAYER_DURATIONS.includes(
    value as (typeof MULTIPLAYER_DURATIONS)[number],
  );
}

export function isValidMultiplayerMode(value: unknown): value is SoloMode {
  return isValidSoloMode(value);
}

export function getRandomMultiplayerText(
  mode: SoloMode = DEFAULT_MULTIPLAYER_MODE,
): string {
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
    if (mode === "punctuation") {
      return "ready? type this line exactly; punctuation matters!";
    }
    if (mode === "numbers") {
      return "version 2.4.1 released at 09:30 with 25% faster load times";
    }
    if (mode === "quote") {
      return "the journey of a thousand miles begins with a single step";
    }
    if (mode === "code") {
      return "const total = items.length > 0 ? items[0] : 0;";
    }
    return "the quick brown fox jumps over the lazy dog";
  }

  const idx = Math.floor(Math.random() * pool.length);
  const selected = pool[idx] ?? pool[0];
  const cleaned = sanitizeTextByMode(selected, mode);

  if (cleaned) return cleaned;
  return mode === "words"
    ? "the quick brown fox jumps over the lazy dog"
    : getRandomMultiplayerText("words");
}
