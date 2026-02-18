import {
  DEFAULT_SOLO_DURATION,
  SOLO_DURATIONS,
} from "../soloplay/soloplay-constants";
import { SOLO_TEXT_POOL } from "../soloplay/text-pool";

export const MULTIPLAYER_DURATIONS = SOLO_DURATIONS;
export const DEFAULT_MULTIPLAYER_DURATION = DEFAULT_SOLO_DURATION;

function cleanText(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function isValidMultiplayerDuration(
  value: number,
): value is (typeof MULTIPLAYER_DURATIONS)[number] {
  return MULTIPLAYER_DURATIONS.includes(
    value as (typeof MULTIPLAYER_DURATIONS)[number],
  );
}

export function getRandomMultiplayerText() {
  if (!Array.isArray(SOLO_TEXT_POOL) || SOLO_TEXT_POOL.length === 0) {
    return "the quick brown fox jumps over the lazy dog";
  }

  const idx = Math.floor(Math.random() * SOLO_TEXT_POOL.length);
  const selected = SOLO_TEXT_POOL[idx] ?? SOLO_TEXT_POOL[0];
  const cleaned = cleanText(selected);

  return cleaned || "the quick brown fox jumps over the lazy dog";
}
