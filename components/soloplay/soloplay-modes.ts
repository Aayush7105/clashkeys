export const SOLO_MODES = ["words", "punctuation", "numbers", "quote"] as const;

export type SoloMode = (typeof SOLO_MODES)[number];

export const DEFAULT_SOLO_MODE: SoloMode = "words";

export function isValidSoloMode(value: unknown): value is SoloMode {
  return (
    typeof value === "string" && SOLO_MODES.includes(value as SoloMode)
  );
}
