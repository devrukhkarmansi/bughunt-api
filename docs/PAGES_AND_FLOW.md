# Pages and User Flow

## 1. Landing Page (`/`)
- **Purpose**: Initial entry point, game introduction
- **Components**:
  - Game title and logo
  - Brief game description
  - Two main buttons:
    - "Create Room" (Host)
    - "Join Room" (Player)
  - How to play section
  - Game rules summary

## 2. Create Room Page (`/create`)
- **Purpose**: Room creation for host
- **Components**:
  - Nickname input
  - Optional room settings:
    - Turn time limit
    - Allow spectators
    - Private room
  - "Create Room" button
  - Back button

## 3. Join Room Page (`/join`)
- **Purpose**: Room joining for players
- **Components**:
  - Nickname input
  - Room code input
  - "Join Room" button
  - Back button
  - Error messages for invalid codes

## 4. Waiting Room (`/room/[roomCode]`)
- **Purpose**: Pre-game lobby
- **Components**:
  - Room code display (with copy button)
  - Player list:
    - Host (with crown icon)
    - Other players
    - Ready status for each player
  - Ready/Not Ready toggle button
  - Start game button (host only)
  - Leave room button
  - Chat box (optional)
  - Player count (X/4)

## 5. Game Board (`/game/[roomCode]`)
- **Purpose**: Main game interface
- **Components**:
  - Game board (4x6 grid)
  - Player information:
    - Current player indicator
    - Player scores
    - Turn timer
  - Game controls:
    - End turn button
    - Leave game button
  - Match counter
  - Game status (playing/ended)

## 6. Game End Page (`/game/[roomCode]/end`)
- **Purpose**: Game results and next steps
- **Components**:
  - Final scores
  - Winner announcement
  - Player rankings
  - Options:
    - Play again
    - Create new room
    - Join another room
    - Leave game

## User Flow

### 1. Host Flow
```
Landing Page → Create Room → Waiting Room → Game Board → Game End
```

### 2. Player Flow
```
Landing Page → Join Room → Waiting Room → Game Board → Game End
```

## Page Transitions

### 1. Room Creation
```typescript
interface CreateRoomResponse {
  success: boolean;
  roomCode: string;
  error?: string;
}

// Flow:
1. User enters nickname
2. Clicks "Create Room"
3. Server generates room code
4. Redirects to waiting room
```

### 2. Room Joining
```typescript
interface JoinRoomResponse {
  success: boolean;
  room?: GameRoom;
  error?: string;
}

// Flow:
1. User enters nickname and room code
2. Clicks "Join Room"
3. Server validates room
4. Redirects to waiting room
```

### 3. Game Start
```typescript
interface GameStartResponse {
  success: boolean;
  gameState: GameState;
  error?: string;
}

// Flow:
1. Host clicks "Start Game"
2. Server validates all players are ready
3. Generates game board
4. Redirects to game board
```

## Error States

### 1. Room Errors
- Room not found
- Room is full
- Invalid room code
- Nickname already taken

### 2. Game Errors
- Player disconnected
- Game state sync error
- Invalid move
- Turn timeout

## Loading States

### 1. Page Transitions
- Loading spinner
- Progress bar
- Skeleton screens

### 2. Game Actions
- Card flip animation
- Match animation
- Score update animation
- Turn transition animation

## Responsive Design

### 1. Mobile View
- Stacked layout
- Touch-friendly controls
- Simplified UI elements
- Portrait orientation optimized

### 2. Desktop View
- Grid layout
- Mouse/keyboard controls
- Full feature set
- Landscape orientation optimized

## Navigation Guards

### 1. Route Protection
- Prevent direct access to game board without room
- Prevent access to ended game
- Prevent joining full rooms
- Prevent duplicate nicknames

### 2. State Protection
- Save game state on disconnect
- Reconnect handling
- Session persistence
- Room state recovery 