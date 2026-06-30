# ClashKeys

ClashKeys is a full-stack web application designed to help users improve
their typing speed, accuracy, and consistency through interactive typing
challenges. The platform provides real-time feedback, tracks user
performance over time, and maintains a competitive leaderboard to
encourage continuous improvement.

The application is suitable for students, professionals, and anyone
looking to enhance their typing skills. By combining timed typing tests
with detailed performance analytics, ClashKeys offers an engaging and
effective learning experience.

## Features

-   User authentication and secure account management
-   Timed typing tests with configurable durations
-   Real-time calculation of Words Per Minute (WPM) and typing accuracy
-   Detailed performance statistics and progress tracking
-   Personal typing history and stored test results
-   Global leaderboard to compare performance with other users
-   Responsive interface optimized for desktop and mobile devices
-   Clean and intuitive user experience with fast page navigation

## Real-Time Communication

ClashKeys uses Socket.IO to establish a persistent real-time connection
between the client and the server. Instead of repeatedly sending HTTP
requests, the application maintains a WebSocket connection that allows
data to be exchanged instantly.

This enables features such as:

-   Live typing synchronization during multiplayer typing sessions
-   Instant broadcasting of player progress and results
-   Real-time leaderboard updates
-   Immediate game state synchronization for all connected players
-   Low-latency communication for a smooth competitive experience

The socket-based architecture ensures that every participant receives
updates as soon as they occur, making multiplayer typing battles
responsive and interactive.

## Local Development

Multiplayer needs the Next.js app and the Socket.IO server running at the
same time.

In one terminal, start the app:

```bash
npm run dev
```

In another terminal, start the socket server:

```bash
npm run dev:socket
```

The local client defaults to `http://localhost:4000` for sockets. If you
run the socket server somewhere else, set `NEXT_PUBLIC_SOCKET_URL` to that
origin before starting the Next.js dev server.

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

### Backend

-   Node.js
-   Express.js
-   TypeScript


### Real-Time

-   Socket.IO (WebSockets)


## Purpose

The primary goal of ClashKeys is to provide a modern platform where
users can regularly practice typing, measure their improvement, and
compete with others. The project demonstrates the implementation of a
complete full-stack application, including authentication, database
management, REST APIs, real-time communication using WebSockets, and
responsive frontend development.
