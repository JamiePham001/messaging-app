# Messaging App — Discord Clone

A full-stack Discord-inspired messaging application built with Next.js 16. The project mirrors Discord's core GUI and feature set, focusing on real-time messaging, a multi-server/multi-channel architecture, and role-based access control.

## Demo
[Link](https://transcendent-begonia-849e08.netlify.app) to the hoested application on Netlify.

### Demo accounts:
**User 1:**  
email: john.doe@outlook.com  
password: Password1!

**User 2:**   
email: sarah.jones@gmail.com  
password: Password2!  

---

- [Features](#features)
  - [Real-Time Messaging & Presence](#real-time-messaging--presence)
  - [Multi-Server & Multi-Channel Architecture](#multi-server--multi-channel-architecture)
  - [Role-Based Permissions (RBAC)](#role-based-permissions-rbac)
  - [Authentication](#authentication)
  - [Friends System](#friends-system)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Run the Development Server](#run-the-development-server)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Data Model Overview](#data-model-overview)
- [Limitations & What Could Be Improved](#limitations--what-could-be-improved)

---

## Features

### Real-Time Messaging & Presence

- Live chat powered by [Ably](https://ably.com), with message history and real-time streaming
- Typing indicators via Ably's `useTyping()` hook
- User presence tracking (online/offline) synced across the app using Ably presence channels
- Member sidebars show live online status

### Multi-Server & Multi-Channel Architecture

- Users can create and join multiple servers
- Each server contains **channel groups** (categories) and **channels** within them, mirroring Discord's server → category → channel hierarchy
- Direct messages (DMs) between friends exist alongside server channels
- Public server discovery page for browsing joinable servers
- Invite-link system: shareable 8-character codes with 30-day expiry

### Role-Based Permissions (RBAC)

- Two built-in role tiers: **Admin**, and **Member**, and another hidden role is **Owner**, which holds the admin role, but also has exclusive access to deleting the server
- Roles carry a numeric `rank` — higher rank means broader permissions. So far this feature hasn't been completely implemented and is currently being used to order roles by appearance.
- Admin-gated actions: creating channel groups, creating channels with restricted access, updating role ranks
- Channel-level and category-level exclusivity: channels and groups can be restricted to specific roles or individual users
- Server settings modal with a dedicated roles management page

### Authentication

- Credential-based registration (email + password, hashed with bcryptjs)
- JWT session strategy with a 6-month session lifetime
- Edge-compatible auth middleware for route protection

### Friends System

- Send, accept, and reject friend requests
- Friends list displayed in the DM sidebar
- Pending request management from within the UI

---

## Tech Stack

| Layer      | Technology                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                                                                              |
| Language   | [TypeScript 5](https://www.typescriptlang.org)                                                                             |
| UI         | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) |
| Real-Time  | [Ably](https://ably.com) + [@ably/chat](https://github.com/ably/ably-chat-js)                                              |
| Auth       | [NextAuth v5](https://authjs.dev) (Credentials + GitHub OAuth)                                                             |
| ORM        | [Prisma 7](https://www.prisma.io)                                                                                          |
| Database   | PostgreSQL                                                                                                                 |
| Validation | [Zod](https://zod.dev)                                                                                                     |
| Deployment | [Netlify](https://www.netlify.com)                                                                                         |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running PostgreSQL instance

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_URL="http://localhost:3000"

DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db>"

ABLY_API_KEY="<ably-api-key>"
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the development server (Turbopack) |
| `npm run build` | Build for production                     |
| `npm run start` | Start the production server              |
| `npm run lint`  | Run ESLint                               |

---

## Project Structure

```
src/
├── app/
│   ├── api/                  # REST API route handlers
│   │   ├── ably-auth/        # Ably JWT token endpoint
│   │   ├── auth/             # NextAuth handlers
│   │   ├── channels/         # Channel CRUD
│   │   ├── friends/          # Friend request management
│   │   ├── message/          # Message creation
│   │   ├── server/           # Server, roles, invites, channel groups
│   │   └── user/             # User registration & status
│   ├── channels/             # Protected app pages
│   │   ├── me/               # DM views
│   │   └── [serverId]/       # Server channel views
│   ├── invite/[code]/        # Invite acceptance page
│   ├── discovery/servers/    # Public server browser
│   ├── login/                # Login page
│   └── register/             # Registration page
├── components/
│   ├── layout/app/
│   │   ├── ably/             # Real-time chat & presence components
│   │   ├── primarySidebar/   # Resizable left sidebar (DMs + server list)
│   │   ├── communityServer/  # Server view & member sidebar
│   │   └── profileWidget/    # User status widget
│   └── modal/                # Server settings, roles, invite, channel creation
├── lib/
│   ├── db/queries.ts         # Prisma query functions
│   └── prisma.ts             # Prisma client singleton
└── types/                    # Shared TypeScript interfaces
prisma/
├── schema.prisma             # Database models
└── migrations/               # Migration history
```

---

## Data Model Overview

```
User ──< Friendship
User ──< Channel (many-to-many, DMs & server channels)
User ──< Server (many-to-many)
Server ──< ServerChannelGroup (categories)
Server ──< ServerRoles
Server ──< ServerInvite
ServerChannelGroup ──< Channel
Channel ──< Message
ServerRoles ──< User (many-to-many)
ServerRoles ──< Channel (exclusive access)
ServerRoles ──< ServerChannelGroup (exclusive access)
```

---

## Limitations & What Could Be Improved

Next.js's serverless execution model does not support persistent background processes, which makes a few Discord-like real-time features harder to implement cleanly:

- **Live friend request notifications** — A dedicated WebSocket server (e.g., with Socket.io on an Express/Node backend) would allow the server to push friend request events to connected clients instantly, without polling.
- **Server administration events** — Role changes, member kicks, and channel updates could be broadcast in real time to all affected clients.
- **Notification system** — Unread counts and mention badges require a persistent connection layer to stay accurate without frequent client-side polling.

A framework pairing like **Node.js + Express** (for the WebSocket server) alongside a frontend framework, or a platform like **Supabase Realtime**, would be better suited to these use cases. The Ably integration covers the core chat channel well, but extending it to cover all app-level events adds complexity.
