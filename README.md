# ClashKeys — Database & Authentication Integration Guide

ClashKeys is a modern, real-time typing platform built with Next.js, React, Socket.IO, and TypeScript. This document serves as the complete technical blueprint and README guide for integrating a **PostgreSQL Database** and **NextAuth.js (Auth.js) Authentication** to track individual user profiles, typing history, performance statistics, and leaderboards.

---

## Architecture Overview

```mermaid
flowchart TD
    Client[Next.js Client] -->|OAuth Login| NextAuth[NextAuth.js / Auth.js]
    Client -->|REST API / Async Saves| NextAPI[Next.js App Router API]
    Client -->|Live Race Sockets| SocketServer[Socket.IO Server]

    NextAuth -->|Prisma Adapter| Postgres[(PostgreSQL Database)]
    NextAPI -->|Prisma ORM| Postgres
    SocketServer -->|Socket Token Auth| NextAPI
```

---

## Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion + Lucide Icons + Recharts
- **Database**: PostgreSQL (Hosted via Neon, Supabase, or Railway)
- **ORM**: Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js) with GitHub & Google OAuth
- **Real-time Server**: Node.js + Socket.IO

---

## Key Features to Integrate

1. **User Authentication & Accounts**:
   - OAuth login with GitHub and Google.
   - Secure server-side sessions via NextAuth.js.
   - Protected routes and session context across client components.

2. **User Profiles & Settings**:
   - Unique custom username system (`/profile/[username]`).
   - Profile bio, avatar management, and preferred keyboard layout.
   - Private personal dashboard (`/profile`).

3. **Typing Statistics & History Tracking**:
   - Save detailed solo and multiplayer test results (`POST /api/results`).
   - Stores WPM, Raw WPM, Accuracy, Keystrokes, and interactive performance graph data (WPM history over time).
   - Dynamic charts powered by Recharts on user profile dashboards.

4. **Multiplayer Authentication**:
   - Short-lived signed socket tokens connecting Socket.IO player sockets to authenticated user accounts.
   - Automated room match recording (`RoomMatch` & `RoomParticipant`).

5. **Global Leaderboards**:
   - Top players aggregated by mode (15s, 30s, 60s, words) and accuracy.

---

## Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// NextAuth Models
model User {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  results       TypingResult[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ClashKeys App Models
model Profile {
  id             String            @id @default(cuid())
  userId         String            @unique
  username       String            @unique
  displayName    String
  bio            String?
  avatarUrl      String?
  keyboardLayout String            @default("QWERTY")
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  participants   RoomParticipant[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model TypingResult {
  id              String   @id @default(cuid())
  userId          String
  mode            String   // e.g. "time_30", "words_25"
  durationSeconds Int
  isMultiplayer   Boolean  @default(false)
  roomId          String?
  wpm             Float
  rawWpm          Float
  burstWpm        Float?
  accuracy        Float
  correctChars    Int
  incorrectChars  Int
  totalKeystrokes Int
  elapsedMs       Int
  wpmHistory      Json     // Array of WPM numbers per second
  rawWpmHistory   Json?
  errorPoints     Json?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RoomMatch {
  id           String            @id @default(cuid())
  roomId       String
  mode         String
  participants RoomParticipant[]
  createdAt    DateTime          @default(now())
}

model RoomParticipant {
  id        String    @id @default(cuid())
  matchId   String
  profileId String
  wpm       Float
  accuracy  Float
  rank      Int
  match     RoomMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  profile   Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
```

---

## API Routes Plan

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth login, logout, and provider callbacks |
| `/api/profile` | GET/PUT | Fetch or update user profile info |
| `/api/profile/[username]` | GET | Fetch public profile stats and history |
| `/api/results` | POST/GET | Save a new test result or query history |
| `/api/leaderboard` | GET | Top players sorted by WPM and accuracy |
| `/api/socket-token` | POST | Generate a signed session token for Socket.IO |

---

## Environment Variables (`.env.local`)

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/clashkeys?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# OAuth Credentials
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Socket Authentication Secret
SOCKET_AUTH_SECRET="your-socket-auth-shared-secret"
```

---

## Setup & Deployment Steps

1. **Install Required Packages**:
   ```bash
   npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter zod
   ```

2. **Initialize Prisma & Apply Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Run Development Servers**:
   ```bash
   # Run Next.js frontend
   npm run dev

   # Run Socket.IO real-time server
   npm run dev:socket
   ```

4. **Production Deployment**:
   - Deploy PostgreSQL instance on Neon, Supabase, or Railway.
   - Configure environment variables on Vercel / hosting provider.
   - Run `npx prisma migrate deploy` in build pipeline.
