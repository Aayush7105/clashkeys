# ClashKeys

ClashKeys is a competitive typing game with solo practice and real-time multiplayer races. Create or join a room with a 4-digit code, run timed rounds, and compare results on a live leaderboard.

## Highlights

- Solo mode at `/soloplay` with durations: `15s`, `30s`, `60s`, `120s`
- Multiplayer lobby at `/multiplayer` with room codes like `#1234`
- Host-controlled multiplayer room at `/room` (host sets mode + duration and starts/restarts rounds)
- Real-time progress sync through Socket.IO
- Post-race analytics: `WPM`, `Raw WPM`, `Burst WPM`, accuracy, error points, and leaderboard ranking

## Typing Modes

Both solo and multiplayer support:

- `words`
- `punctuation`
- `numbers`
- `quote`
- `code`

Text sourcing behavior:

- `words`: Wikipedia random summary API with local fallback pool
- `quote`: Quotable API with local fallback pool
- `punctuation`, `numbers`, `code`: local curated text pools

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Socket.IO client + server
- Express socket server

## Routes

- `/` - landing page
- `/soloplay` - solo typing
- `/multiplayer` - create/join room
- `/room` - multiplayer room
- `/api/health` - frontend health endpoint

Useful query params:

- `/soloplay?duration=60&mode=quote`
- `/room?roomId=%231234&name=Alex&duration=30&mode=words`

## Local Development

1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Install socket server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Start socket server (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   Socket server runs on `http://localhost:4000`.
4. Start Next.js app (Terminal 2):
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`.

## Environment Variables

Frontend:

- `NEXT_PUBLIC_SOCKET_URL` - socket server URL.
- If not set:
  - development fallback: `http://localhost:4000`
  - production fallback: same-origin (`window.location.origin`)

Socket server:

- `PORT` - server port (defaults to `4000`; Render sets this automatically)
- `FRONTEND_ORIGIN` - comma-separated allowed origins for Socket.IO CORS
- `CORS_ORIGIN` - fallback if `FRONTEND_ORIGIN` is not set

Local default allowed origins:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## Health Checks

- Frontend (Vercel): `/api/health`
- Socket server (Render): `/health`
- Socket server also supports `/api/health` for backward compatibility

Recommended UptimeRobot setup:

- Primary monitor: `https://<your-render-service>.onrender.com/health`
- Optional frontend monitor: `https://<your-frontend-domain>/api/health`
- Method: `GET` or `HEAD`
- Interval: `5 minutes`

## Deploy (Vercel + Render)

1. Deploy socket server on Render:
   - Create a `Web Service` from this repo
   - Set `Root Directory` to `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add env var:
     - `FRONTEND_ORIGIN=https://<your-vercel-domain>`
2. Copy Render URL (example: `https://clashkeys-socket.onrender.com`).
3. Configure Vercel project env vars:
   - `NEXT_PUBLIC_SOCKET_URL=https://<your-render-service>.onrender.com`
4. Redeploy frontend.
5. Verify by joining the same room from two devices/browsers and confirming live sync.

Optional preview support:

- Set `FRONTEND_ORIGIN` on Render as a comma-separated list, for example:
  - `https://<prod>.vercel.app,https://<preview>.vercel.app,http://localhost:3000`

## Scripts

Root (`package.json`):

- `npm run dev` - start Next.js development server
- `npm run build` - create production build
- `npm run start` - run Next.js production server
- `npm run lint` - run ESLint

Server (`server/package.json`):

- `npm run dev` - start Express + Socket.IO server
- `npm run start` - production start

## Project Structure

- `app/` - Next.js routes (`/`, `/soloplay`, `/multiplayer`, `/room`, `/api/health`)
- `components/` - gameplay UI, charts, score screens, and mode logic
- `lib/` - shared utilities (`socket` warmup/connect logic, helpers)
- `server/` - standalone Express + Socket.IO backend
