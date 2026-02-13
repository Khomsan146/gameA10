# Party Card Game

A real-time multiplayer party card game built with React Native and Node.js.

## Project Structure

```
party-card-game/
├── server/          # Node.js + Socket.IO backend
├── client/          # React Native (Expo) mobile app
└── docs/            # Design specs and implementation plan
```

## Getting Started

### Server Setup

```bash
cd server
npm install
npm run dev
```

Server will run on `http://localhost:3001`

### Client Setup

```bash
cd client
npm install
npm start
```

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Socket.IO (WebSocket)
- Express
- Redis (optional, for production scaling)

**Frontend:**
- React Native (Expo)
- Socket.IO Client
- React Navigation
- React Native Reanimated

## Game Rules

See [design_spec.md](./design_spec.md) for complete game mechanics and rules.
