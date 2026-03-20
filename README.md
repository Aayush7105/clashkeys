# ClashKeys

ClashKeys is a competitive typing game with solo practice and real-time multiplayer races. Create or join a room with a 4-digit code, run timed rounds, and compare results on a live leaderboard.

## Features

- Solo mode (`/soloplay`) with duration options: `15s`, `30s`, `60s`, `120s`
- Multiplayer lobby (`/multiplayer`) to create or join rooms like `#1234`
- Host-controlled room flow (`/room`): host starts rounds, sets duration, and can restart
- Real-time multiplayer sync with Socket.IO
- Post-race analytics: `WPM`, `Raw WPM`, `Burst WPM`, accuracy, errors, and ranked leaderboard
- Prompt text pulled from Wikipedia random summaries with local fallback text pools

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Socket.IO (client + server)
- Express (socket server)

## Local Development

1. Install root dependencies:
   ```bash
   npm install
   ```
1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
1. Start the socket server (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:4000`.
1. Start the Next.js app (Terminal 2):
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:3000`.

## Configuration

- Frontend socket URL uses `NEXT_PUBLIC_SOCKET_URL`.
- If `NEXT_PUBLIC_SOCKET_URL` is not set:
  - Development fallback is `http://localhost:4000`
  - Production fallback is same-origin (`window.location.origin`)
- Socket server listens on `PORT` (Render sets this automatically).
- Allowed socket origins are controlled by `FRONTEND_ORIGIN` (or `CORS_ORIGIN`) as a comma-separated list.
- Local default allowed origins are `http://localhost:3000` and `http://127.0.0.1:3000`.

## Health Checks (UptimeRobot)

- Frontend health endpoint (Vercel): `/api/health`
- Realtime socket health endpoint (Render): `/health`
- To prevent multiplayer cold starts, monitor the Render socket URL (not only the Vercel URL), for example:
  - `https://<your-render-service>.onrender.com/health`
- Optional second monitor for frontend availability:
  - `https://<your-frontend-domain>/api/health`
- Recommended UptimeRobot interval: `5 minutes` with `GET` (or `HEAD`) requests.

## Deploy: Vercel + Render (Multiplayer)

1. Deploy socket server on Render:
   - Create a new `Web Service` from this repo.
   - Set `Root Directory` to `server`.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add env var:
     - `FRONTEND_ORIGIN=https://<your-vercel-domain>`
   - Deploy and copy the Render URL (example: `https://clashkeys-socket.onrender.com`).
1. Configure Vercel frontend:
   - Add env var:
     - `NEXT_PUBLIC_SOCKET_URL=https://<your-render-service>.onrender.com`
   - Redeploy the Vercel project.
1. Optional for preview deployments:
   - Set `FRONTEND_ORIGIN` on Render to a comma-separated list, for example:
     - `https://<prod>.vercel.app,https://<preview>.vercel.app,http://localhost:3000`
1. Verify:
   - Open the Vercel app, join the same room from two browsers/devices, and confirm live progress updates.

## Scripts

Root (`package.json`):

- `npm run dev` - start Next.js in development mode
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

Server (`server/package.json`):

- `npm run dev` - start Express + Socket.IO server
- `npm run start` - production start for Render

## Project Structure

- `app/` - Next.js routes (`/`, `/soloplay`, `/multiplayer`, `/room`, `/api/health`)
- `components/` - gameplay UI, score views, charts, and mode-specific logic
- `lib/` - shared utilities (including socket client setup)
- `server/` - standalone Express + Socket.IO backend
