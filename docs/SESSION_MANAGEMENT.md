# Session & Room Management

## User Session Management

### 1. Anonymous User Identity
```typescript
interface AnonymousUser {
  id: string;          // Unique UUID v4
  nickname: string;    // User-provided nickname
  sessionToken: string; // Browser session identifier
  createdAt: number;   // Timestamp
  avatarColor: string; // Random color assigned
}
```

### 2. Session Storage
- **Client-side**: 
  - LocalStorage to persist user data
  - Session cookie as backup
```typescript
// Example localStorage structure
{
  "bugHunt_userId": "uuid-v4-here",
  "bugHunt_nickname": "Player123",
  "bugHunt_sessionToken": "session-token-here"
}
```

## Room Management

### 1. Room Structure
```typescript
interface GameRoom {
  roomCode: string;     // 6-character unique code (e.g., "AXBY12")
  hostId: string;       // Creator's userId
  players: {
    [userId: string]: {
      nickname: string;
      isHost: boolean;
      isReady: boolean;
      joinedAt: number;
      lastPing: number;
    }
  };
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;   // 4 players max
  createdAt: number;
  settings: GameSettings;
}

interface GameSettings {
  turnTimeLimit: number;
  allowSpectators: boolean;
  isPrivate: boolean;
}
```

### 2. Room Code Generation
```typescript
function generateRoomCode(): string {
  // Generates a 6-character code
  // Format: LETTERS + NUMBERS (e.g., "AXBY12")
  // Ensures uniqueness by checking against active rooms
  return 'XXXXXX';
}
```

## Flow Diagrams

### 1. Creating a Room
```
User → Enter Nickname → Generate Session → Create Room → Get Room Code
```

### 2. Joining a Room
```
User → Enter Nickname + Room Code → Validate Room → Join Socket Room → Update Room State
```

## Implementation Details

### 1. First-time User Visit
```typescript
// When user first visits the site
function handleNewUser() {
  const userId = uuid.v4();
  const sessionToken = generateSessionToken();
  
  localStorage.setItem('bugHunt_userId', userId);
  localStorage.setItem('bugHunt_sessionToken', sessionToken);
  
  return {
    userId,
    sessionToken
  };
}
```

### 2. Room Creation
```typescript
interface CreateRoomResponse {
  success: boolean;
  roomCode: string;
  error?: string;
}

async function createRoom(hostUser: AnonymousUser): Promise<CreateRoomResponse> {
  const roomCode = generateRoomCode();
  const room: GameRoom = {
    roomCode,
    hostId: hostUser.id,
    players: {
      [hostUser.id]: {
        nickname: hostUser.nickname,
        isHost: true,
        isReady: false,
        joinedAt: Date.now(),
        lastPing: Date.now()
      }
    },
    status: 'waiting',
    maxPlayers: 4,
    createdAt: Date.now(),
    settings: {
      turnTimeLimit: 30,
      allowSpectators: false,
      isPrivate: false
    }
  };
  
  return { success: true, roomCode };
}
```

### 3. Room Joining
```typescript
interface JoinRoomResponse {
  success: boolean;
  room?: GameRoom;
  error?: string;
}

async function joinRoom(
  roomCode: string, 
  user: AnonymousUser
): Promise<JoinRoomResponse> {
  // Validate room exists and has space
  // Add user to room
  // Notify other players
  // Return updated room state
}
```

## Socket Events for Room Management

```typescript
// Server → Client Events
interface ServerToClientEvents {
  'room:joined': (room: GameRoom) => void;
  'room:playerJoined': (player: AnonymousUser) => void;
  'room:playerLeft': (playerId: string) => void;
  'room:playerReady': (playerId: string) => void;
  'room:error': (error: string) => void;
}

// Client → Server Events
interface ClientToServerEvents {
  'room:join': (roomCode: string, user: AnonymousUser) => void;
  'room:leave': () => void;
  'room:ready': () => void;
  'room:ping': () => void;
}
```

## Security Considerations

1. **Rate Limiting**:
   - Room creation: 5 per hour per IP
   - Room joining attempts: 10 per minute per IP

2. **Room Validation**:
   - Check for full rooms
   - Validate room codes
   - Prevent duplicate nicknames in same room

3. **Session Protection**:
   - Validate session tokens
   - Clear inactive sessions
   - Prevent session hijacking

4. **Room Cleanup**:
   - Auto-close empty rooms
   - Remove inactive players
   - Clean up finished games

## Error Handling

```typescript
enum RoomError {
  ROOM_FULL = 'This room is full',
  ROOM_NOT_FOUND = 'Room not found',
  INVALID_CODE = 'Invalid room code',
  NICKNAME_TAKEN = 'Nickname already taken in this room',
  SESSION_EXPIRED = 'Your session has expired'
}
```

## Data Persistence (In-Memory)

```typescript
// In-memory storage (until we add a database)
const activeRooms: Map<string, GameRoom> = new Map();
const activeSessions: Map<string, AnonymousUser> = new Map();
``` 