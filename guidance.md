# Punctuation Mode Feature Guide

This guide is for adding a `punctuation` mode from the navbar so that typing text includes punctuation when selected.

## 1) Define the feature scope first

Before touching any component code, finalize the exact behavior contract below. This avoids rework later.

### 1.1 Goal statement (write this first in your own words)

- Add a `punctuation` mode in navbar for solo typing.
- When mode is `punctuation`, generated text must include punctuation and users must type it correctly.
- Existing `words` behavior must remain unchanged.

### 1.2 Mode contract (must be explicit)

- Supported modes now: `words`, `punctuation`
- Default mode: `words`
- Invalid mode from URL must fallback to `words`
- Mode must be represented in URL query as `mode=<value>`
- Mode change must reset active test state and load mode-correct text

### 1.3 Text rules per mode (decide before coding)

- `words` mode: keep current normalization behavior (letters + spaces only), with no punctuation in target text.
- `punctuation` mode: preserve standard punctuation characters in target text, and require exact matching for punctuation and spacing.

Recommended punctuation set to support first:
- `. , ? ! : ; ' " ( ) -`

### 1.4 URL behavior contract

- `/soloplay` means default mode (`words`) if no `mode` is present
- `/soloplay?mode=words` selects words mode
- `/soloplay?mode=punctuation` selects punctuation mode
- Any unknown value (example: `mode=abc`) must be treated as `words`
- Existing `duration` query param behavior must remain intact

### 1.5 UI behavior contract

- `words` and `punctuation` must be clickable in navbar (desktop + mobile menu)
- Current selected mode must be visibly active
- Unimplemented mode labels (`numbers`, `quote`, etc.) should not behave like active features
- Switching mode should not break duration selection

### 1.6 Reset behavior on mode switch

When user changes mode:

- Input state resets
- Timer/test state resets
- New text is loaded for selected mode
- Previous run stats are not reused

This should be treated the same way a new test starts.

### 1.7 Non-goals for this task (to keep scope tight)

- Do not implement full `numbers`, `quote`, or `zen` behavior now
- Do not redesign multiplayer unless you explicitly choose to extend this feature there
- Do not change scoring logic beyond what is needed for punctuation correctness

### 1.8 Step-1 completion checklist

Step 1 is complete only when all these are decided and written down:

1. Final allowed modes list
2. Default mode
3. Exact punctuation support set
4. URL fallback rule for invalid mode
5. Reset behavior definition
6. Explicit non-goals

## 2) Map the current flow (where to edit)

You will mainly touch:

- `components/game-navbar.tsx`
- `components/soloplay/soloplay-page.tsx`
- `app/soloplay/page.tsx`
- `components/soloplay/solotypingarea.tsx`
- `components/soloplay/text-pool.ts` (or split this into mode-specific pools)

Optional multiplayer extension:

- `components/multiplayer/multiplayerarea.tsx`
- `components/multiplayer/multiplayer-constants.ts`
- server event payload handling in `server/index.js`

## 3) Add mode state to the navbar API

In `components/game-navbar.tsx`:

- Add props for current mode and mode change callback (similar to duration props)
- Convert mode items from static `<div>` to interactive controls (use buttons)
- Wire `punctuation` click to call mode change callback
- Wire `words` click to call mode change callback
- Keep other mode labels (`numbers`, `quote`, etc.) visually disabled or non-interactive until implemented
- Add active styling based on selected mode (like duration selected style)
- Keep mobile and desktop behavior consistent
- Add accessibility:
  - `type="button"`
  - `aria-pressed` for selected mode
  - clear title/label for each mode

## 4) Sync mode with URL in solo page

In `components/soloplay/soloplay-page.tsx`:

- Parse `mode` from `searchParams`
- Validate mode value and fallback to default (`words`) if invalid
- Add `handleModeChange` similar to `handleDurationChange`
- Update URL query with `mode` via `router.replace(...)`
- Pass `currentMode` and `onModeChange` to `GameNavbar`
- Ensure typing area remounts when mode changes:
  - include mode in `key` (for example conceptually: key should vary by duration + mode)

## 5) Make server text generation mode-aware

In `app/soloplay/page.tsx`:

- Include `mode` in `searchParams` typing and parsing
- Validate mode and set a default
- Update `getSentence()` (or split into helpers) to accept mode
- Use different cleaning rules:
  - `words` mode: current behavior (letters + spaces)
  - `punctuation` mode: preserve punctuation marks needed for typing tests
- Keep fallback behavior robust:
  - if API text fails, use fallback pool for that mode
- Return `initialText` based on selected mode

## 6) Update sanitization in typing area

In `components/soloplay/solotypingarea.tsx`:

- Current sanitize function removes punctuation (`replace(/[^a-z\\s]/g, "")`), which will break the new mode
- Make sanitization mode-aware, or remove duplicate sanitization if text is already cleaned upstream
- Ensure character matching remains exact for punctuation mode
- Verify caret and error highlighting still work for punctuation characters

## 7) Prepare punctuation-ready fallback text

In `components/soloplay/text-pool.ts`:

- Add a punctuation-capable pool (or split into two pools)
- Keep enough entries so repeat frequency is low
- Include realistic punctuation: commas, periods, apostrophes, question marks, quotes
- Avoid exotic Unicode punctuation unless you explicitly want it

## 8) Keep type safety clean

Create/keep a strict mode type (recommended):

- Use a string union for mode values
- Centralize allowed modes in one place to avoid drift between files
- Reuse the same validator in client and server-side page logic

## 9) Decide multiplayer behavior

If you want this feature only in solo now:

- Keep multiplayer unchanged
- Hide/disable mode toggles in multiplayer navbar usage to avoid misleading UI

If you also want multiplayer punctuation mode:

- Add mode state to room flow
- Host controls mode selection
- Include mode in `start-test` payload
- Ensure all clients receive the same text/mode for fairness

## 10) Manual verification checklist

Run through this checklist after implementation:

1. Open `/soloplay` with no query params -> default mode is `words`.
2. Click `punctuation` in navbar -> URL updates with `mode=punctuation`.
3. Text shown contains punctuation characters.
4. Typing punctuation characters is required for correctness.
5. Switch back to `words` -> new text has punctuation stripped per words-mode rules.
6. Duration selection still works exactly as before.
7. Refresh page -> selected mode persists from URL.
8. Mobile navbar mode selection works the same as desktop.
9. Invalid query (like `mode=abc`) safely falls back to default mode.

## 11) Regression checks

After feature implementation:

- Run lint and type-check
- Confirm no hydration warnings from mode-dependent rendering
- Confirm no stale text is reused after mode switch

## 12) Suggested implementation order

Use this order to avoid chasing bugs:

1. Add shared mode type + validator
2. Wire mode query parsing in solo page
3. Wire navbar mode clicks and selected UI
4. Make server text generation mode-aware
5. Fix typing-area sanitization for punctuation mode
6. Add mode-specific fallback pool
7. Run manual checklist and regression checks

## 13) Bottom execution steps (follow exactly in order)

1. Create mode constants and validator first.
File target: `components/soloplay/soloplay-constants.ts` or a new `components/soloplay/soloplay-modes.ts`.
Add allowed values (`words`, `punctuation`), default value (`words`), and a single validator function.

2. Update navbar props before wiring behavior.
File target: `components/game-navbar.tsx`.
Add `currentMode` and `onModeChange` props.
Convert `words` and `punctuation` items into buttons and apply selected style by `currentMode`.

3. Keep unimplemented navbar items visibly disabled.
File target: `components/game-navbar.tsx`.
Leave `numbers`, `quote`, `zen`, `time` labels non-functional unless you are implementing them now.

4. Add mode parsing in solo page query handling.
File target: `components/soloplay/soloplay-page.tsx`.
Read `mode` from `searchParams`, validate it, and fallback to default mode on invalid input.

5. Add mode update handler and URL sync.
File target: `components/soloplay/soloplay-page.tsx`.
Create `handleModeChange`, update `mode` in query params, and call `router.replace(...)` without scroll jump.

6. Force typing area reset on mode change.
File target: `components/soloplay/soloplay-page.tsx`.
Include `mode` in the `SoloTypingArea` key so switching mode always starts a fresh run.

7. Make server-side solo text generation mode-aware.
File target: `app/soloplay/page.tsx`.
Parse `mode`, validate it, pass it into text generation, and return mode-correct `initialText`.

8. Split text cleaning rules by mode.
File target: `app/soloplay/page.tsx`.
Keep current clean rule for `words`.
For `punctuation`, preserve punctuation set and normalize only what is truly unwanted.

9. Add mode-based fallback text pools.
File target: `components/soloplay/text-pool.ts`.
Either keep two arrays (`WORDS_TEXT_POOL`, `PUNCTUATION_TEXT_POOL`) or one structure keyed by mode.
Ensure punctuation pool includes real punctuation usage.

10. Make typing-area sanitize logic mode-safe.
File target: `components/soloplay/solotypingarea.tsx`.
Current sanitize removes punctuation; replace with mode-aware sanitize or remove duplicate sanitize if upstream text is already clean.

11. Validate exact-character matching for punctuation.
File target: `components/soloplay/solotypingarea.tsx`.
Confirm punctuation characters are treated exactly like letters for correctness calculation.

12. Run focused manual tests in this order.
Test `words` default, switch to punctuation, refresh persistence, invalid mode fallback, duration + mode combination, and mobile menu mode switch.

13. Run regression checks.
Run lint and type-check.
Verify no hydration mismatch, no stale text after mode switch, and no duration regression.

14. Optional multiplayer extension (separate pass).
Only after solo is stable, decide whether to include mode in room state and `start-test` payload for synchronized multiplayer behavior.

## 14) Sample code reference with detailed explanation

Use these snippets as templates. Adjust naming to your preferred structure.

### 14.1 Mode constants and validator (single source of truth)

Suggested file: `components/soloplay/soloplay-modes.ts`

```ts
export const SOLO_MODES = ["words", "punctuation"] as const;

export type SoloMode = (typeof SOLO_MODES)[number];

export const DEFAULT_SOLO_MODE: SoloMode = "words";

export function isValidSoloMode(value: unknown): value is SoloMode {
  return (
    typeof value === "string" &&
    SOLO_MODES.includes(value as SoloMode)
  );
}
```

Why this is important:

- Keeps allowed values centralized.
- Prevents typo bugs like `"puntuation"` in one file and `"punctuation"` in another.
- Gives you strict TypeScript support (`SoloMode`) everywhere.

### 14.2 Navbar API wiring sample (`GameNavbar`)

Suggested file: `components/game-navbar.tsx`

```tsx
import type { SoloMode } from "@/components/soloplay/soloplay-modes";

type GameNavbarProps = {
  currentDuration: number;
  durations: readonly number[];
  onDurationChange: (duration: number) => void;
  currentMode: SoloMode;
  onModeChange: (mode: SoloMode) => void;
  canChangeDuration?: boolean;
  disabledDurationTitle?: string;
};

const modeButtonClass = (active: boolean) =>
  `flex items-center gap-2 transition ${
    active
      ? "text-yellow-500 font-semibold"
      : "text-neutral-600 hover:text-slate-300"
  }`;

// inside modeItems:
<button
  type="button"
  onClick={() => onModeChange("punctuation")}
  aria-pressed={currentMode === "punctuation"}
  className={modeButtonClass(currentMode === "punctuation")}
>
  <AiOutlineExclamationCircle size={16} />
  <span>punctuation</span>
</button>

<button
  type="button"
  onClick={() => onModeChange("words")}
  aria-pressed={currentMode === "words"}
  className={modeButtonClass(currentMode === "words")}
>
  <span>A</span>
  <span>words</span>
</button>
```

Why this works:

- `GameNavbar` becomes controlled by parent state/query.
- Active style comes from `currentMode`, not internal local state.
- `aria-pressed` improves accessibility for toggle-like buttons.

### 14.3 Solo page mode from URL (no extra mode `useState`)

Suggested file: `components/soloplay/soloplay-page.tsx`

```tsx
import {
  DEFAULT_SOLO_MODE,
  isValidSoloMode,
  type SoloMode,
} from "./soloplay-modes";

const rawMode = searchParams.get("mode");
const mode: SoloMode = isValidSoloMode(rawMode)
  ? rawMode
  : DEFAULT_SOLO_MODE;

const handleModeChange = (nextMode: SoloMode) => {
  if (nextMode === mode) return;
  const params = new URLSearchParams(searchParams.toString());
  params.set("mode", nextMode);
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
};

<GameNavbar
  currentDuration={duration}
  durations={SOLO_DURATIONS}
  onDurationChange={handleDurationChange}
  currentMode={mode}
  onModeChange={handleModeChange}
/>;

<SoloTypingArea
  key={`${duration}-${mode}`}
  duration={duration}
  initialText={initialText}
  mode={mode}
/>;
```

Why no `useState`/`useEffect` here:

- `mode` is derived from URL query params.
- URL change triggers rerender with new `mode`.
- This keeps state consistent across refresh/share/back-forward navigation.

### 14.4 Server-side mode parsing and text generation

Suggested file: `app/soloplay/page.tsx`

```ts
import {
  DEFAULT_SOLO_MODE,
  isValidSoloMode,
  type SoloMode,
} from "@/components/soloplay/soloplay-modes";
import {
  WORDS_TEXT_POOL,
  PUNCTUATION_TEXT_POOL,
} from "@/components/soloplay/text-pool";

function cleanTextForWords(text: string) {
  return text
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTextForPunctuation(text: string) {
  return text
    .replace(/[^A-Za-z\s.,?!:;'"()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPoolFallback(mode: SoloMode): string {
  const pool = mode === "punctuation" ? PUNCTUATION_TEXT_POOL : WORDS_TEXT_POOL;
  if (!pool.length) return "";
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? pool[0];
}

async function getSentence(mode: SoloMode): Promise<string> {
  // fetch wiki...
  // choose cleaner by mode:
  // const cleaned = mode === "punctuation"
  //   ? cleanTextForPunctuation(extract)
  //   : cleanTextForWords(extract);
  // fallback with getPoolFallback(mode)
  return getPoolFallback(mode);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ duration?: string; mode?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  // Keep your existing duration parsing/validation logic here.
  const initialDuration = /* existing duration logic */ DEFAULT_SOLO_DURATION;

  const rawMode = params?.mode;
  const mode: SoloMode = isValidSoloMode(rawMode) ? rawMode : DEFAULT_SOLO_MODE;
  const initialText = await getSentence(mode);

  return <SoloPlayPage initialText={initialText} initialDuration={initialDuration} />;
}
```

Why this is needed:

- Keeps initial text generation consistent with selected mode.
- Prevents frontend from receiving already-stripped text in punctuation mode.
- Handles invalid query values safely on server side.

### 14.5 Typing area mode-aware sanitization

Suggested file: `components/soloplay/solotypingarea.tsx`

```tsx
import type { SoloMode } from "./soloplay-modes";

interface SoloTypingAreaProps {
  duration: number;
  initialText: string;
  mode: SoloMode;
}

function sanitizeTextByMode(text: string, mode: SoloMode) {
  if (mode === "punctuation") {
    return text
      .toLowerCase()
      .replace(/[^a-z\s.,?!:;'"()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const targetText = sanitizeTextByMode(initialText, mode);
```

Why this is critical:

- Your current sanitize function removes punctuation, which would silently break punctuation mode.
- With mode-aware sanitize, comparison logic (`typedChar === char`) can stay unchanged.

### 14.6 Mode-specific fallback text pools

Suggested file: `components/soloplay/text-pool.ts`

```ts
export const WORDS_TEXT_POOL = [
  "the quick brown fox jumps over the lazy dog",
  "focus is deciding what not to do",
];

export const PUNCTUATION_TEXT_POOL = [
  "Success isn't final; failure isn't fatal.",
  "Do it now, not tomorrow.",
  "Ready? Type this line exactly!",
];
```

Why split pools:

- Ensures punctuation mode always has punctuation-heavy fallback data.
- Prevents accidental punctuation stripping by reusing words-only text.

### 14.7 Quick mental model (data flow)

```txt
navbar click -> updates ?mode=...
-> soloplay page reads mode from URL
-> server/client generate mode-correct text
-> typing area sanitizes by mode
-> exact character matching (including punctuation)
```
