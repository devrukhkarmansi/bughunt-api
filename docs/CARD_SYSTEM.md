# Card System Design

## Card Data Structure

### 1. Bug-Solution Pair Interface
```typescript
interface BugSolutionPair {
  id: string;           // Unique identifier for the pair
  bug: {
    id: string;
    title: string;      // Short bug description
    description: string; // Detailed bug description
    category: BugCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];     // For categorization
  };
  solution: {
    id: string;
    description: string; // Solution description
    code?: string;      // Optional code snippet
    explanation: string; // Why this solution works
  };
}

enum BugCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  GENERAL = 'general'
}
```

### 2. Card Interface
```typescript
interface Card {
  id: string;
  pairId: string;      // Reference to BugSolutionPair
  type: 'bug' | 'solution';
  content: {
    title: string;
    description: string;
    category: BugCategory;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  isFlipped: boolean;
  isMatched: boolean;
  position: number;     // Position on the board
}
```

## Card Data Storage

### 1. Initial Data Structure (JSON)
```typescript
// bugs.json
{
  "pairs": [
    {
      "id": "pair_001",
      "bug": {
        "id": "bug_001",
        "title": "Infinite Loop in useEffect",
        "description": "Component re-renders infinitely due to missing dependency array",
        "category": "FRONTEND",
        "difficulty": "medium",
        "tags": ["react", "hooks", "performance"]
      },
      "solution": {
        "id": "sol_001",
        "description": "Add missing dependencies to useEffect dependency array",
        "code": "useEffect(() => {\n  // effect code\n}, [dependency1, dependency2]);",
        "explanation": "React's useEffect hook requires all external values used inside the effect to be listed in the dependency array"
      }
    },
    // ... more pairs
  ]
}
```

### 2. Card Generation
```typescript
interface CardGenerationOptions {
  difficulty?: ('easy' | 'medium' | 'hard')[];
  categories?: BugCategory[];
  count?: number;  // Number of pairs to generate
}

function generateGameCards(options: CardGenerationOptions): Card[] {
  // 1. Filter pairs based on options
  // 2. Randomly select pairs
  // 3. Create cards for each pair
  // 4. Shuffle cards
  // 5. Assign positions
  return [];
}
```

## Card Management System

### 1. Card Deck Manager
```typescript
class CardDeckManager {
  private pairs: BugSolutionPair[];
  private activeCards: Card[];
  
  constructor(pairs: BugSolutionPair[]) {
    this.pairs = pairs;
    this.activeCards = [];
  }
  
  generateDeck(options: CardGenerationOptions): Card[] {
    // Implementation
  }
  
  shuffleCards(cards: Card[]): Card[] {
    // Fisher-Yates shuffle implementation
  }
  
  validateMatch(card1: Card, card2: Card): boolean {
    return card1.pairId === card2.pairId && 
           card1.type !== card2.type;
  }
}
```

### 2. Card State Management
```typescript
interface CardState {
  flippedCards: Card[];
  matchedPairs: string[];
  currentTurn: string;  // playerId
  lastAction: {
    playerId: string;
    action: 'flip' | 'match' | 'unflip';
    timestamp: number;
  };
}
```

## Game Board Layout

### 1. Board Configuration
```typescript
interface BoardConfig {
  rows: number;
  columns: number;
  cardSpacing: number;
  cardSize: {
    width: number;
    height: number;
  };
}

const DEFAULT_BOARD_CONFIG: BoardConfig = {
  rows: 4,
  columns: 6,
  cardSpacing: 10,
  cardSize: {
    width: 120,
    height: 160
  }
};
```

### 2. Card Positioning
```typescript
function calculateCardPosition(
  index: number, 
  config: BoardConfig
): { x: number; y: number } {
  const row = Math.floor(index / config.columns);
  const col = index % config.columns;
  
  return {
    x: col * (config.cardSize.width + config.cardSpacing),
    y: row * (config.cardSize.height + config.cardSpacing)
  };
}
```

## Card Interaction

### 1. Card Flip Animation
```typescript
interface CardFlipAnimation {
  duration: number;
  easing: string;
  transform: string;
}

const FLIP_ANIMATION: CardFlipAnimation = {
  duration: 0.6,
  easing: 'ease-in-out',
  transform: 'rotateY(180deg)'
};
```

### 2. Card Selection Logic
```typescript
function handleCardSelection(
  card: Card,
  gameState: CardState
): CardState {
  // 1. Validate if card can be flipped
  // 2. Update flipped cards
  // 3. Check for matches
  // 4. Update game state
  return gameState;
}
```

## Data Loading Strategy

### 1. Initial Load
```typescript
async function loadCardData(): Promise<BugSolutionPair[]> {
  // 1. Load from JSON file
  // 2. Cache in memory
  // 3. Return pairs
  return [];
}
```

### 2. Dynamic Loading
```typescript
async function loadAdditionalPairs(
  category?: BugCategory,
  difficulty?: string
): Promise<BugSolutionPair[]> {
  // Load additional pairs based on filters
  return [];
}
```

## Card Categories and Difficulty Distribution

### 1. Category Distribution
```typescript
const CATEGORY_DISTRIBUTION = {
  FRONTEND: 0.3,
  BACKEND: 0.25,
  DATABASE: 0.15,
  SECURITY: 0.15,
  PERFORMANCE: 0.1,
  GENERAL: 0.05
};
```

### 2. Difficulty Distribution
```typescript
const DIFFICULTY_DISTRIBUTION = {
  easy: 0.4,
  medium: 0.4,
  hard: 0.2
};
```

## Future Enhancements

1. **Dynamic Content**:
   - API integration for bug-solution pairs
   - Community-contributed pairs
   - Difficulty ratings based on player performance

2. **Customization**:
   - Custom card decks
   - Difficulty adjustments
   - Category filters

3. **Analytics**:
   - Track most common bugs
   - Player performance metrics
   - Learning patterns 