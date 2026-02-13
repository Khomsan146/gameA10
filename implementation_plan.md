# Implementation Plan: Party Card Game

## Phase 1: Project Initialization
- [ ] **Repo Setup**: Initialize Git repo `party-card-game`.
- [ ] **Frontend**: 
  - [ ] Initialize React Native project with Expo (`npx create-expo-app@latest party-card-client`).
  - [ ] Setup TypeScript, ESLint, Prettier.
  - [ ] Install dependencies: `react-navigation`, `socket.io-client`, `react-native-reanimated`.
- [ ] **Backend**:
  - [ ] Initialize Node.js project (`npm init -y`).
  - [ ] Setup TypeScript, `ts-node`.
  - [ ] Install dependencies: `express`, `socket.io`, `uuid`, `redis` (optional dev dependency).

## Phase 2: Backend Core (Game Server)
- [ ] **WebSocket Server**:
  - [ ] Create basic Socket.IO server listening on port 3000.
  - [ ] Implement connection/disconnection handlers.
- [ ] **Room Manager**:
  - [ ] specific `Room` class to hold state.
  - [ ] Implement `createRoom()`, `joinRoom(code)`, `leaveRoom(socketId)`.
- [ ] **Game Logic**:
  - [ ] specific `Game` class with `deck`, `players`, `turnIndex`.
  - [ ] Implement `shuffleDeck()`, `drawCard()`, `nextTurn()`.
  - [ ] Implement specific card rules (K, Q, J, 10, A).
  - [ ] Implement "Fire Rule" counter logic.

## Phase 3: Frontend Foundation
- [ ] **Navigation**:
  - [ ] Set up `Stack.Navigator`.
  - [ ] Create screens: `Home`, `Lobby`, `Game`, `EndScreen`.
- [ ] **UI Components**:
  - [ ] `Card` component (flip animation support).
  - [ ] `PlayerAvatar` component (with active turn highlight).
  - [ ] `ActionButton` (Draw, Use Shield).
- [ ] **Lobby System**:
  - [ ] Connect "Create Room" button to backend.
  - [ ] Connect "Join Room" input to backend.
  - [ ] Display list of players in Lobby.

## Phase 4: Gameplay Loop Integration
- [ ] **Real-time Sync**:
  - [ ] Listen for `GAME_STATE_UPDATE` events.
  - [ ] Render game board based on received state.
- [ ] **Actions**:
  - [ ] Wire "Draw Card" button to emit `DRAW_CARD` event.
  - [ ] Handle `CARD_DRAWN` event to animate card from deck to discard pile.
  - [ ] Handle `PLAYER_TURN_CHANGED` event to update active player indicator.
- [ ] **Special Handling**:
  - [ ] Implement modal for "King Selection" (choosing a target).
  - [ ] Implement "Shield" UI when player has a Q.

## Phase 5: Visuals & Polish
- [ ] **Animations**:
  - [ ] Card fly-in animations using `react-native-reanimated`.
  - [ ] "Direction Change" indicator flip animation.
  - [ ] "Explosion/Fire" effect for 4-of-a-kind.
- [ ] **Sound**:
  - [ ] Integrate `expo-av`.
  - [ ] Add sound effects: Card flip, Glass clink, Crowd cheer.
- [ ] **Theme**:
  - [ ] Apply "Cyberpunk/Neon" color palette (Dark coding 101).
  - [ ] Custom fonts (Google Fonts via Expo).

## Phase 6: QA & Deployment
- [ ] **Testing**:
  - [ ] Unit test backend game logic (crucial for card rules).
  - [ ] Playtest with 3-4 simulated clients.
- [ ] **Optimization**:
  - [ ] Minimize payload size (send only diffs if needed).
  - [ ] Ensure 60fps animations.
- [ ] **Build**:
  - [ ] Configure `eas.json` for Expo builds.
  - [ ] Deploy backend to render.com or similar.

