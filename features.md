# Feature Notes: Solo Punctuation + Time Mode

This document explains exactly what was changed, in execution order, and why.  
It is written so you can reuse the same pattern for future features.

## 1) End-to-end flow (what now happens)

1. User clicks a mode in the navbar (`time` or `punctuation`).
2. The client updates URL query param `mode=...` using `router.replace(...)`.
3. Solo page re-renders from URL state and passes mode down.
4. Server route (`app/soloplay/page.tsx`) reads mode and chooses text source.
5. Typing area gets mode-aware text and mode-aware sanitization.
6. Matching/accuracy logic works on the final normalized target text.

Important current behavior:

- `time` and `punctuation` are mutually exclusive (only one highlighted).
- `time` maps to internal mode value `"words"`.
- `punctuation` mode currently uses local punctuation pool (no Wikipedia API).

## 2) File-by-file changes in correct implementation order

## File: `components/soloplay/soloplay-modes.ts`

What changed:

- Added allowed mode list: `["words", "punctuation"]`.
- Added strict type: `SoloMode`.
- Added default mode: `DEFAULT_SOLO_MODE = "words"`.
- Added runtime validator: `isValidSoloMode(...)`.

Why:

- Centralizes mode rules in one place.
- Avoids string typo bugs across files.
- Provides compile-time safety + runtime safety.

---

## File: `components/soloplay/text-pool.ts`

What changed:

- Split text into:
- `WORDS_TEXT_POOL`
- `PUNCTUATION_TEXT_POOL`
- Kept backward-compat alias:
- `SOLO_TEXT_POOL = WORDS_TEXT_POOL`

Why:

- Ensures punctuation mode always has punctuation-ready content.
- Keeps older imports working (especially multiplayer constants).
- Reduces risk of breaking existing features while evolving data model.

---

## File: `components/game-navbar.tsx`

What changed:

- Added new optional props:
- `currentMode?: SoloMode`
- `onModeChange?: (mode: SoloMode) => void`
- `canChangeMode?: boolean`
- `disabledModeTitle?: string`
- Added controlled mode handling:
- `punctuation` button selects `"punctuation"`
- `time` button selects `"words"`
- Active style now depends on `currentMode`.
- Added mode accessibility:
- `type="button"`
- `aria-pressed`
- Disabled mode interactions when callback is not passed.
- Kept non-implemented labels (`numbers`, `quote`, `zen`) as non-interactive.

Why:

- Makes navbar mode selection controlled by parent/page state.
- Prevents mode state desync.
- Supports both solo and multiplayer reuse:
- Solo passes mode handlers.
- Multiplayer can omit mode handlers and the controls become disabled.

---

## File: `components/soloplay/soloplay-page.tsx`

What changed:

- Parsed mode from query string: `searchParams.get("mode")`.
- Validated mode with `isValidSoloMode(...)`; fallback to default mode.
- Added `handleModeChange` to update URL query with `mode`.
- Passed mode props to navbar:
- `currentMode={mode}`
- `onModeChange={handleModeChange}`
- Passed mode to typing area.
- Changed typing-area key from `duration` to ``${duration}-${mode}``.

Why:

- URL becomes source of truth for mode.
- Changing mode updates browser/shareable URL.
- Remount key ensures full test reset when mode changes (no stale typing state).

---

## File: `app/soloplay/page.tsx`

What changed:

- Added mode parsing from server-side `searchParams`.
- Added mode validation using `isValidSoloMode(...)`.
- Added mode-based pool fallback selector.
- Updated text generation policy:
- For `"punctuation"`: return punctuation pool text directly.
- For `"words"`: try Wikipedia -> clean words-only -> fallback words pool.

Why:

- Keeps server-provided initial text aligned with selected mode.
- Matches your requirement:
- Punctuation mode should not unexpectedly switch to API/words style text.
- Preserves existing words mode behavior with API + fallback.

---

## File: `components/soloplay/solotypingarea.tsx`

What changed:

- Added `mode` prop to typing area interface.
- Added `sanitizeTextByMode(text, mode)`:
- `"words"` removes punctuation.
- `"punctuation"` preserves punctuation set.
- Added mode-aware local fallback text.
- Target text now built from `initialText` + mode-aware sanitize.

Why:

- Prevents punctuation from being stripped in punctuation mode.
- Keeps correctness comparison (`typedChar === char`) accurate for punctuation.
- Ensures fallback target always exists, mode-consistent.

## 3) Why this architecture works (reusable pattern)

1. Mode definition is centralized (`soloplay-modes.ts`).
2. UI controls are controlled components (`GameNavbar`).
3. URL carries state (`mode`), so refresh/share/back work naturally.
4. Server generation is mode-aware.
5. Typing normalization is mode-aware.
6. Component remount key prevents stale runtime state.

This pattern is exactly what you should reuse for `numbers`, `quote`, etc.

## 4) Template to add next mode (example: `numbers`)

1. Add new mode constant + type support in `soloplay-modes.ts`.
2. Add mode text source (pool and/or API strategy) in `text-pool.ts` + `app/soloplay/page.tsx`.
3. Add navbar button mapping to that mode in `game-navbar.tsx`.
4. Parse + validate mode in `soloplay-page.tsx`; update query on click.
5. Pass mode to typing area and include mode in remount key.
6. Extend sanitize function in `solotypingarea.tsx`.
7. Run type-check + lint.
8. Verify mode switch, duration switch, refresh persistence, and invalid query fallback.

## 5) Current state summary

- `time` and `punctuation` are exclusive.
- `time` keeps the timed words flow.
- `punctuation` uses punctuation pool content.
- Duration buttons still work normally.
