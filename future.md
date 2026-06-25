# Future Plan: Login, Profiles, and PostgreSQL

## Goal

Add persistent player accounts to ClashKeys so users can log in, manage a profile, save solo and multiplayer results, and view long-term typing stats from a PostgreSQL database.

## Current App Shape

- The Next.js app owns the UI routes: `/`, `/soloplay`, `/multiplayer`, `/room`, and `/api/health`.
- The Socket.IO server in `server/index.js` owns live room state in memory.
- Multiplayer players are currently identified by socket id and display name.
- Scores are calculated in the client and shown at the end of solo or multiplayer tests.
- No database, auth provider, or persistent user model exists yet.

## Recommended Direction

Use PostgreSQL as the main database and add an ORM layer in the Next.js app. The most straightforward path is:

- Auth: Auth.js/NextAuth with OAuth providers such as Google or GitHub.
- Database access: Prisma ORM connected to PostgreSQL.
- App data owner: the Next.js app should own users, profiles, saved results, and public stats APIs.
- Realtime owner: the Socket.IO server should keep live race state, but receive a verified user identity when authenticated players join rooms.

Alternative: use a managed auth product such as Clerk or Supabase Auth if you want less auth maintenance. If you choose that path later, keep the same app tables for profiles and typing results.

## Phase 1: Database Foundation

1. Add PostgreSQL locally and in production.
2. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` or deployment-specific auth URL if the auth library requires it
   - OAuth provider secrets, for example `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. Install database/auth packages when ready:
   - `prisma`
   - `@prisma/client`
   - `next-auth`
   - `@auth/prisma-adapter`
4. Create `prisma/schema.prisma`.
5. Add a reusable database client, for example `lib/db.ts`.
6. Add migration scripts to `package.json`, for example:
   - `db:generate`
   - `db:migrate`
   - `db:studio`

## Phase 2: Core Schema

Start with a schema that supports auth, profiles, and saved test results.

Suggested tables/models:

- `User`: auth user record, email, name, image, timestamps.
- `Account`: OAuth provider account linkage.
- `Session`: login session storage if using database sessions.
- `VerificationToken`: email or magic-link verification if used.
- `Profile`: public username, display name, avatar, bio, country, keyboard layout, theme preference, privacy flags.
- `TypingResult`: one saved solo or multiplayer test result.
- `RoomMatch`: one completed multiplayer race.
- `RoomParticipant`: one player inside a completed multiplayer race.
- `UserStats`: optional aggregate table for fast profile pages and leaderboards.

Important fields for `TypingResult`:

- `id`
- `userId`
- `mode`
- `durationSeconds`
- `isMultiplayer`
- `roomId`
- `wpm`
- `rawWpm`
- `burstWpm`
- `accuracy`
- `correctChars`
- `incorrectChars`
- `totalKeystrokes`
- `elapsedMs`
- `wpmHistory` as `Json`
- `rawWpmHistory` as `Json`
- `burstWpmHistory` as `Json`
- `errorPoints` as `Json`
- `createdAt`

Use nullable `userId` only if you want to store guest results. Otherwise, save only authenticated results.

## Phase 3: Auth Routes and Session Access

1. Add an `auth.ts` file at the project root or in `lib/auth.ts`.
2. Configure Auth.js with the Prisma adapter and selected providers.
3. Add the auth route handler under `app/api/auth/[...nextauth]/route.ts`.
4. Add server helpers for reading the current user/session in route handlers and server components.
5. Add client helpers/components for:
   - Sign in
   - Sign out
   - Current user menu
   - Guest state
6. Update `components/game-navbar.tsx` and the landing page header to show login/profile actions.

Recommended first login providers:

- GitHub for developer-friendly testing.
- Google for mainstream sign-in.

Keep email/password for later unless you specifically want to own password reset, email verification, abuse handling, and account recovery.

## Phase 4: Profile Management

Add these routes:

- `/login`: friendly sign-in page.
- `/profile`: current user's private dashboard.
- `/profile/[username]`: public profile.
- `/settings/profile`: edit display name, username, avatar, bio, and preferences.

Profile features:

- Unique username.
- Display name.
- Avatar URL or provider image.
- Bio.
- Keyboard layout/preferred mode.
- Public/private stats toggle.
- Account deletion/export plan for later.

Validation rules:

- Usernames should be lowercase, unique, 3-24 characters, and limited to letters, numbers, `_`, and `-`.
- Display names should be trimmed and length-limited.
- Bio should be length-limited.
- Never trust client-sent `userId`; always derive it from the server session.

## Phase 5: Saving Solo Results

1. When a solo test finishes, send the score payload to a protected API route, for example `POST /api/results`.
2. The route handler should read the session, validate the payload, and insert a `TypingResult`.
3. Store graph arrays and error points as JSON.
4. Return the saved result id.
5. Show "saved" state on the score page for logged-in users.
6. For guests, show a sign-in prompt after the score without blocking replay.

API shape:

```ts
POST /api/results
{
  mode: "words",
  durationSeconds: 30,
  isMultiplayer: false,
  wpm: 82,
  rawWpm: 89,
  burstWpm: 110,
  accuracy: 96,
  correctChars: 246,
  incorrectChars: 10,
  totalKeystrokes: 256,
  elapsedMs: 30000,
  wpmHistory: [70, 78, 82],
  rawWpmHistory: [75, 86, 89],
  burstWpmHistory: [92, 101, 110],
  errorPoints: [{ "second": 12, "wpm": 76 }]
}
```

## Phase 6: Saving Multiplayer Results

The Socket.IO server currently owns room state but does not know persistent users. Add identity in one of these ways:

Recommended approach:

1. Keep Auth.js session handling in the Next.js app.
2. Add a protected route such as `POST /api/socket-token` that returns a short-lived signed token containing `userId`, `username`, and `displayName`.
3. The client passes that token in the Socket.IO `auth` payload when connecting.
4. The Socket.IO server verifies the token with a shared secret.
5. Store both `socketId` and `userId` in room users.

Then, at the end of a multiplayer race:

1. The host or server emits a final result event.
2. The backend creates one `RoomMatch`.
3. The backend creates one `RoomParticipant` per player.
4. Each authenticated participant gets a linked `TypingResult`.
5. Guests can remain anonymous participants if guest play is still allowed.

This keeps live race updates fast while making completed matches persistent.

## Phase 7: Stats and Leaderboards

Add profile stats after results are saved:

- Best WPM by mode and duration.
- Average WPM.
- Average accuracy.
- Tests completed.
- Total time typed.
- Recent results.
- WPM history chart.
- Mode breakdown.
- Multiplayer wins, podiums, and races.

Start with direct queries from `TypingResult`. Add `UserStats` later if profile pages or leaderboards become slow.

Leaderboards to add later:

- Global best WPM by mode/duration.
- Friends-only leaderboard if friend accounts are added.
- Weekly leaderboard.
- Multiplayer wins leaderboard.

## Phase 8: Security and Privacy

- Validate every API payload with a schema validator such as Zod.
- Rate-limit auth-sensitive and write-heavy routes.
- Never accept `userId` from the client for writes.
- Keep `DATABASE_URL`, auth secrets, and OAuth secrets out of git.
- Add CORS rules for the socket server that match production frontend origins.
- Use short-lived socket identity tokens.
- Decide whether profile stats are public by default or private by default.
- Add a delete-account path before storing sensitive long-term data.

## Phase 9: Deployment Plan

PostgreSQL hosting options:

- Neon
- Supabase Postgres
- Railway
- Render PostgreSQL
- Vercel Postgres or another Vercel-compatible database provider

Deployment checklist:

1. Create production PostgreSQL database.
2. Add `DATABASE_URL` and auth env vars to Vercel.
3. Add any socket token secret to both Vercel and Render.
4. Run Prisma migrations during deploy or as a manual release step.
5. Update Render socket server env vars:
   - `FRONTEND_ORIGIN`
   - shared socket auth secret if used
6. Verify:
   - User can sign in.
   - Profile is created.
   - Solo result saves.
   - Multiplayer room still works.
   - Multiplayer result saves with the correct user ids.

## Suggested Implementation Order

1. Add Prisma and PostgreSQL connection.
2. Add Auth.js with one OAuth provider.
3. Create automatic profile creation after first login.
4. Add `/profile` and `/settings/profile`.
5. Save solo results.
6. Add stats queries to profile.
7. Add socket identity token flow.
8. Save multiplayer matches.
9. Add public profiles and leaderboards.

## Reference Docs To Recheck Before Implementation

- Auth.js Prisma adapter: https://authjs.dev/getting-started/adapters/prisma
- Prisma supported databases and PostgreSQL support: https://www.prisma.io/docs/orm/reference/supported-databases
- Next.js route handlers: https://nextjs.org/docs/app/getting-started/route-handlers
