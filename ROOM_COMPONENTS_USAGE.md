# Room Components: `roompage.tsx` vs `waitingroom.tsx`

## Quick Difference

- `components/room/roompage.tsx` is the **main multiplayer controller**.
- `components/room/waitingroom.tsx` is a **presentational waiting-lobby UI** used by `roompage.tsx`.

`roompage.tsx` owns socket logic, timer logic, typing state, and conditional screen switching.
`waitingroom.tsx` only renders lobby UI from props and calls callbacks.

## File Responsibilities

### `components/room/roompage.tsx`

- Reads query params (`roomId`, `name`) from URL.
- Connects/disconnects Socket.IO and joins room.
- Subscribes to room events:
  - `room-users-update`
  - `progress-update`
  - `test-started`
- Tracks game state:
  - users list and host detection
  - text, typed input, and progress emission
  - timer (`timeLeft`), test running/end state
  - keystrokes and backspaces for score metrics
- Chooses which screen to render:
  - Missing details screen
  - `ScorePage`
  - `WaitingRoomPage`
  - Active typing race UI

### `components/room/waitingroom.tsx`

- Receives props from `roompage.tsx`:
  - `roomId`, `name`, `users`, `hostId`, `isHost`, `onStart`, `onExit`
- Shows waiting-room details:
  - room title/code
  - player list
  - host/player labels
- Shows host-only start button (`onStart`) or waiting badge for non-host users.
- Shows back button (`onExit`).
- Does not connect sockets and does not manage game state.

## All Uses in This Codebase

### 1) Route Entry for `roompage.tsx`

- `app/room/page.tsx:1` imports `RoomPage` from `@/components/room/roompage`.
- `app/room/page.tsx:5` renders `<RoomPage />`.

### 2) Navigation into `/room` route

- `components/multiplayer/multiplayer-page.tsx:33` pushes to `/room?roomId=...&name=...` when creating a room.
- `components/multiplayer/multiplayer-page.tsx:52` pushes to `/room?roomId=...&name=...` when joining a room.

### 3) `waitingroom.tsx` usage

- `components/room/roompage.tsx:8` imports `WaitingRoomPage` from `./waitingroom`.
- `components/room/roompage.tsx:206` renders `<WaitingRoomPage ... />` when `isRunning` is `false`.

## Render Flow Summary

1. User creates/joins room from multiplayer page.
2. App navigates to `/room` with `roomId` and `name` query params.
3. `app/room/page.tsx` renders `RoomPage`.
4. `RoomPage` joins socket room and waits.
5. While test is not running, `RoomPage` renders `WaitingRoomPage`.
6. Host starts test; all clients switch to typing race UI.
7. On timer end, `RoomPage` renders `ScorePage`.
