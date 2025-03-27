# Bug Hunt Game - UI Implementation Guide

## Game Flow

### 1. Initial Screen
- Display welcome screen with:
  - "Create Room" button
  - "Join Room" input field + button
  - Nickname input field

### 2. Room Creation Flow
```typescript
// When creating room
socket.emit('room:create', {
  event: 'room:create',
  data: { nickname: 'Player1' }
});

// Response -> Show room code to share
socket.on('room:created', (response) => {
  const { roomCode, host } = response.data;
  // Display room code
  // Show waiting for players screen
});
```

### 3. Room Joining Flow
```typescript
// When joining room
socket.emit('room:join', {
  event: 'room:join',
  data: {
    roomCode: 'ABC123',
    nickname: 'Player2'
  }
});

// Both players receive this
socket.on('room:joined', (response) => {
  const { roomCode, players } = response.data;
  // Update players list in UI
  // If host, show "Start Game" button
  // If not host, show "Waiting for host to start" message
});
```

### 4. Game Start Flow
```typescript
// Host clicks "Start Game"
socket.emit('room:startGame', {
  event: 'room:startGame',
  data: { roomCode: 'ABC123' }
});

// All players receive game state
socket.on('game:started', (response) => {
  const { gameState } = response.data;
  // Initialize game board with cards
  // Show scores (0-0)
  // Highlight current player's turn
});
```

### 5. Gameplay UI Elements

#### Game Board
- 12 cards (6 pairs) in a grid
- Each card should have:
  - Front face (hidden content)
  - Back face (visible when not flipped)
  - Visual states:
    - Unflipped (default)
    - Flipped (showing content)
    - Matched (stays flipped, different style)

#### Player Information
- Display for each player:
  - Nickname
  - Score
  - Matches found
  - Visual indicator for current turn

#### Turn Indicator
- Clear visual feedback for:
  - Whose turn it is
  - "Your turn!" message
  - "Opponent's turn" message

### 6. Game Events and UI Updates

#### Card Flip
```typescript
// When clicking a card
socket.emit('game:flipCard', {
  event: 'game:flipCard',
  data: {
    gameId: currentGameId,
    cardId: clickedCardId
  }
});

// Card flip response
socket.on('game:cardFlipped', (response) => {
  const { gameState, cardId, playerId } = response.data;
  // Animate card flip
  // Show card content
  // Disable clicking more cards if second flip
});
```

#### Match Found
```typescript
socket.on('game:match', (response) => {
  const {
    gameState,
    matchedCards,
    message
  } = response.data;
  
  // 1. Show match animation
  // 2. Update scores
  // 3. Keep cards flipped
  // 4. Show message ("Player found a match!")
  // 5. Enable card clicking (same player's turn)
});
```

#### No Match
```typescript
socket.on('game:noMatch', (response) => {
  const { cards, message } = response.data;
  
  // 1. Show no-match animation
  // 2. Show message
  // 3. Wait 1 second (cards remain visible)
  // 4. Flip cards back (animate)
});

socket.on('game:turnChanged', (response) => {
  const {
    currentPlayer,
    message
  } = response.data;
  
  // 1. Update turn indicator
  // 2. Show whose turn message
  // 3. Enable/disable card clicking based on turn
});
```

#### Game Over
```typescript
socket.on('game:over', (response) => {
  const {
    winners,
    isTie,
    message
  } = response.data;
  
  // 1. Show game over overlay
  // 2. Display winner(s) and scores
  // 3. Show message
  // 4. Option to play again or return to menu
});
```

### 7. Error Handling

```typescript
socket.on('game:error', (response) => {
  const { message } = response.data;
  // Show error message in a toast/notification
});
```

## UI States to Implement

1. **Welcome State**
   - Nickname input
   - Create/Join options

2. **Room State**
   - Room code display
   - Players list
   - Start game button (host only)
   - Waiting message (non-host)

3. **Game State**
   - Game board with cards
   - Player scores
   - Turn indicator
   - Match/No-match animations
   - Victory screen

4. **Loading States**
   - Joining room
   - Starting game
   - Waiting for opponent

5. **Error States**
   - Invalid room code
   - Room full
   - Connection lost
   - Invalid move

## Recommended UI Components

1. **Card Component**
   - Props: id, content, isFlipped, isMatched
   - Animations: flip, match, unmatch

2. **GameBoard Component**
   - Grid of cards
   - Handles card layout and positioning

3. **PlayerInfo Component**
   - Shows player details and scores
   - Highlights current turn

4. **MessageOverlay Component**
   - Displays game messages
   - Shows match/no-match notifications

5. **GameOver Component**
   - Victory/Tie screen
   - Final scores
   - Play again option

## Animation Guidelines

1. **Card Flip**
   - Duration: 300ms
   - Style: 3D flip effect
   - Timing: Ease-in-out

2. **Match Found**
   - Duration: 500ms
   - Style: Glow effect + scale
   - Color: Success theme

3. **No Match**
   - Duration: 300ms
   - Style: Shake effect
   - Color: Error theme

4. **Turn Change**
   - Duration: 200ms
   - Style: Slide transition
   - Timing: After cards flip back

## Responsive Design

- Desktop: 4x3 grid
- Tablet: 3x4 grid
- Mobile: 2x6 grid
- Min card size: 120px x 160px
- Maintain aspect ratio
- Adjust font sizes for readability

## Theme Guidelines

1. **Colors**
   - Primary: Game theme color
   - Success: Match found
   - Error: No match
   - Neutral: Card back
   - Accent: Current turn

2. **Typography**
   - Game title: Display font
   - Card content: Monospace
   - Messages: Sans-serif
   - Scores: Numeric font

3. **Spacing**
   - Card grid: 16px gap
   - Sections: 24px margin
   - Messages: 16px padding

## Accessibility

1. **Keyboard Navigation**
   - Tab through cards
   - Space/Enter to flip
   - Escape for menus

2. **ARIA Labels**
   - Card states
   - Turn indicators
   - Game messages

3. **Color Contrast**
   - Minimum 4.5:1 ratio
   - Visible focus states
   - Alternative indicators

## Loading States

1. **Initial Load**
   - Skeleton cards
   - Pulse animation
   - Progress indicator

2. **Game Actions**
   - Card flip loading
   - Match checking
   - Turn transition

## Error Handling UI

1. **Toast Messages**
   - Invalid moves
   - Connection issues
   - Room errors

2. **Recovery Options**
   - Retry buttons
   - Return to menu
   - Reconnect option 