# Bug Hunt Game - TypeScript Interfaces

## Core Types

```typescript
// Card related types
type CardType = 'bug' | 'solution';
type CardDifficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: string;
  type: CardType;
  content: string;
  difficulty: CardDifficulty;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

// Player related types
interface Player {
  id: string;
  nickname: string;
  score: number;
  matchesFound: number;
}

// Game status
type GameStatus = 'waiting' | 'playing' | 'finished';

interface GameState {
  gameId: string;
  status: GameStatus;
  roomCode: string;
  cards: Card[];
  players: Record<string, Player>;
  currentTurn: string; // player id
  turnNumber: number;
  firstFlippedCard: string | null; // card id
  secondFlippedCard: string | null; // card id
  startedAt: string;
  turnTimeLimit: number;
  currentTurnStartedAt: string;
}

interface GameConfig {
  numberOfPairs: number;
  turnTimeLimit: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}
```

## WebSocket Event Payloads

### Room Events

```typescript
// Room Creation
interface RoomCreatePayload {
  event: 'room:create';
  data: {
    nickname: string;
  };
}

interface RoomCreatedResponse {
  event: 'room:created';
  data: {
    roomCode: string;
    host: {
      id: string;
      nickname: string;
    };
  };
}

// Room Joining
interface RoomJoinPayload {
  event: 'room:join';
  data: {
    roomCode: string;
    nickname: string;
  };
}

interface RoomJoinedResponse {
  event: 'room:joined';
  data: {
    roomCode: string;
    players: Array<{
      id: string;
      nickname: string;
    }>;
  };
}

// Game Start
interface GameStartPayload {
  event: 'room:startGame';
  data: {
    roomCode: string;
  };
}

interface GameStartedResponse {
  event: 'game:started';
  data: GameState;
}
```

### Game Events

```typescript
// Card Flip
interface CardFlipPayload {
  event: 'game:flipCard';
  data: {
    gameId: string;
    cardId: string;
  };
}

interface CardFlippedResponse {
  event: 'game:cardFlipped';
  data: {
    gameState: GameState;
    cardId: string;
    playerId: string;
  };
}

// Match Found
interface MatchResponse {
  event: 'game:match';
  data: {
    gameState: GameState;
    playerId: string;
    matchedCards: [string, string]; // card ids
    message: string;
  };
}

// No Match
interface NoMatchResponse {
  event: 'game:noMatch';
  data: {
    gameState: GameState;
    playerId: string;
    cards: [string, string]; // card ids
    message: string;
  };
}

// Turn Changed
interface TurnChangedResponse {
  event: 'game:turnChanged';
  data: {
    gameState: GameState;
    currentPlayer: {
      id: string;
      nickname: string;
    };
    message: string;
  };
}

// Game Over
interface GameOverResponse {
  event: 'game:over';
  data: {
    gameState: GameState;
    winners: Array<{
      id: string;
      nickname: string;
      score: number;
    }>;
    isTie: boolean;
    message: string;
  };
}
```

### Error Events

```typescript
interface GameErrorResponse {
  event: 'game:error';
  data: {
    message: string;
  };
}
```

## Usage Examples

### Socket Event Handling

```typescript
// Initialize socket with types
const socket: Socket<ServerToClientEvents, ClientToServerEvents>;

// Emit with type checking
socket.emit('room:create', {
  event: 'room:create',
  data: { nickname: 'Player1' }
} as RoomCreatePayload);

// Listen with type checking
socket.on('game:started', (response: GameStartedResponse) => {
  const gameState = response.data;
  // TypeScript knows all properties of gameState
});
```

### Component Props

```typescript
// Card Component Props
interface CardProps {
  card: Card;
  isEnabled: boolean;
  onFlip: (cardId: string) => void;
}

// GameBoard Component Props
interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onCardFlip: (cardId: string) => void;
}

// PlayerInfo Component Props
interface PlayerInfoProps {
  player: Player;
  isCurrentTurn: boolean;
}

// MessageOverlay Component Props
interface MessageOverlayProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// GameOver Component Props
interface GameOverProps {
  winners: Array<{
    id: string;
    nickname: string;
    score: number;
  }>;
  isTie: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}
```

## State Management Types

```typescript
// Game Context State
interface GameContextState {
  gameState: GameState | null;
  currentPlayerId: string | null;
  isMyTurn: boolean;
  lastMessage: string | null;
  error: string | null;
}

// Room Context State
interface RoomContextState {
  roomCode: string | null;
  isHost: boolean;
  players: Array<{
    id: string;
    nickname: string;
  }>;
  status: 'waiting' | 'ready' | 'playing';
}
```

## Utility Types

```typescript
// Response wrapper type
type WebSocketResponse<T> = {
  event: string;
  data: T;
};

// Event union type
type GameEvent =
  | 'game:started'
  | 'game:cardFlipped'
  | 'game:match'
  | 'game:noMatch'
  | 'game:turnChanged'
  | 'game:over'
  | 'game:error';

// Socket event maps
interface ServerToClientEvents {
  'room:created': (response: RoomCreatedResponse) => void;
  'room:joined': (response: RoomJoinedResponse) => void;
  'game:started': (response: GameStartedResponse) => void;
  'game:cardFlipped': (response: CardFlippedResponse) => void;
  'game:match': (response: MatchResponse) => void;
  'game:noMatch': (response: NoMatchResponse) => void;
  'game:turnChanged': (response: TurnChangedResponse) => void;
  'game:over': (response: GameOverResponse) => void;
  'game:error': (response: GameErrorResponse) => void;
}

interface ClientToServerEvents {
  'room:create': (payload: RoomCreatePayload) => void;
  'room:join': (payload: RoomJoinPayload) => void;
  'room:startGame': (payload: GameStartPayload) => void;
  'game:flipCard': (payload: CardFlipPayload) => void;
}
``` 