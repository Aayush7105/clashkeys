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

- Client socket URL is set in `lib/socket.ts` (default: `http://localhost:4000`).
- If you change socket host/port, update `lib/socket.ts`.
- Server CORS is currently open (`origin: "*"` in `server/index.js`) for local development.

## Scripts

Root (`package.json`):

- `npm run dev` - start Next.js in development mode
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

Server (`server/package.json`):

- `npm run dev` - start Express + Socket.IO server

## Project Structure

- `app/` - Next.js routes (`/`, `/soloplay`, `/multiplayer`, `/room`)
- `components/` - gameplay UI, score views, charts, and mode-specific logic
- `lib/` - shared utilities (including socket client setup)
- `server/` - standalone Express + Socket.IO backend
