# ClashKeys

ClashKeys is a competitive typing arena with solo practice and real-time multiplayer rooms. Host a room, share a 4-digit code, race for 60 seconds, and review detailed post-race stats.

**Features**

- Real-time multiplayer rooms with live progress bars and host-controlled starts
- Solo practice mode with adjustable durations and fresh text pulls from Wikipedia (with a local fallback)
- Detailed metrics: WPM/CPM, accuracy, errors, missed characters, and confusion insights
- Focused, high-contrast UI built for speed

**Tech Stack**

- Next.js 16 + React 19
- Tailwind CSS 4
- Socket.io (client + server)
- Express (socket server)

**Local Development**

1. Install app dependencies:
   `npm install`
1. Install server dependencies:
   `cd server`
   `npm install`
1. Start the socket server (Terminal 1):
   `npm run dev`
1. Start the Next.js app (Terminal 2):
   `cd ..`
   `npm run dev`
1. Open the app at `http://localhost:3000`.

**Configuration**

- The client connects to the socket server at `http://localhost:4000`.
- Update `lib/socket.ts` if you change the server host or port.

**Scripts**
App (`package.json`):

- `npm run dev` - start Next.js in dev mode
- `npm run build` - build for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint

Server (`server/package.json`):

- `npm run dev` - start the Socket.io server

**Project Structure**

- `app/` - Next.js routes and layouts
- `components/` - UI and game logic components
- `lib/` - shared client utilities (socket connection)
- `server/` - Express + Socket.io server
