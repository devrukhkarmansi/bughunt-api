import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardDifficulty } from './entities/card.entity';
import { GameState, GameConfig, PlayerGameState } from './entities/game.entity';

/**
 * Service responsible for managing game logic
 */
@Injectable()
export class GameService {
  private games: Map<string, GameState> = new Map();

  // Sample card content - In production, this would come from a database
  private readonly cardContent = {
    easy: [
      {
        bug: 'Null Pointer Exception',
        solution: 'Check for null before accessing object',
      },
      {
        bug: 'Array Index Out of Bounds',
        solution: 'Verify array index is within bounds',
      },
      {
        bug: 'Infinite Loop',
        solution: 'Add proper loop termination condition',
      },
    ],
    medium: [
      { bug: 'Race Condition', solution: 'Implement proper synchronization' },
      { bug: 'Memory Leak', solution: 'Release resources in finally block' },
      { bug: 'SQL Injection', solution: 'Use parameterized queries' },
    ],
    hard: [
      { bug: 'Deadlock', solution: 'Implement proper lock ordering' },
      {
        bug: 'Buffer Overflow',
        solution: 'Validate buffer size before writing',
      },
      { bug: 'Cross-Site Scripting', solution: 'Sanitize user input' },
    ],
  };

  /**
   * Creates a new game state
   * @param roomCode - Code of the room
   * @param players - Array of player IDs and nicknames
   * @param config - Game configuration
   * @returns The created game state
   */
  createGame(
    roomCode: string,
    players: { id: string; nickname: string }[],
    config: GameConfig,
  ): GameState {
    const gameId = uuidv4();
    const cards = this.generateCards(config);

    // Create initial player states
    const playerStates: Record<string, PlayerGameState> = {};
    players.forEach((player) => {
      playerStates[player.id] = {
        id: player.id,
        nickname: player.nickname,
        score: 0,
        matchesFound: 0,
        isCurrentTurn: false,
      };
    });

    // First player starts
    playerStates[players[0].id].isCurrentTurn = true;

    const gameState: GameState = {
      gameId,
      status: 'playing',
      roomCode,
      cards,
      players: playerStates,
      currentTurn: players[0].id,
      turnNumber: 1,
      startedAt: Date.now(),
      turnTimeLimit: config.turnTimeLimit,
      currentTurnStartedAt: Date.now(),
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  /**
   * Handles a card flip action
   */
  handleCardFlip(
    gameId: string,
    playerId: string,
    cardId: string,
  ): {
    gameState: GameState;
    action: 'flip' | 'match' | 'noMatch' | 'error';
  } | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    // Validate it's the player's turn
    if (game.currentTurn !== playerId) {
      return {
        gameState: game,
        action: 'error',
      };
    }

    // Find the card
    const card = game.cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) {
      return {
        gameState: game,
        action: 'error',
      };
    }

    // Flip the card
    card.isFlipped = true;

    // If this is the first card of the turn
    if (!game.firstFlippedCard) {
      game.firstFlippedCard = cardId;
      return {
        gameState: game,
        action: 'flip',
      };
    }

    // This is the second card
    game.secondFlippedCard = cardId;

    // Check for match
    const firstCard = game.cards.find((c) => c.id === game.firstFlippedCard);
    if (firstCard?.matchingCardId === cardId) {
      // Match found!
      card.isMatched = true;
      firstCard.isMatched = true;

      // Update player score
      const player = game.players[playerId];
      player.matchesFound++;
      player.score += this.calculateScore(card.difficulty);

      // Clear flipped cards
      game.firstFlippedCard = undefined;
      game.secondFlippedCard = undefined;

      // Check if game is over
      if (game.cards.every((c) => c.isMatched)) {
        game.status = 'finished';
        game.endedAt = Date.now();
      } else {
        // Player gets another turn for finding a match
        game.currentTurnStartedAt = Date.now();
      }

      return {
        gameState: game,
        action: 'match',
      };
    } else {
      // No match, automatically switch turns after delay
      setTimeout(() => {
        if (firstCard) firstCard.isFlipped = false;
        card.isFlipped = false;
        game.firstFlippedCard = undefined;
        game.secondFlippedCard = undefined;

        // Switch turns
        this.switchTurns(game);
      }, 1000);

      return {
        gameState: game,
        action: 'noMatch',
      };
    }
  }

  /**
   * Switches turns between players
   */
  private switchTurns(game: GameState): void {
    const playerIds = Object.keys(game.players);
    const currentIndex = playerIds.indexOf(game.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    // Update turn information
    game.currentTurn = playerIds[nextIndex];
    game.turnNumber++;
    game.currentTurnStartedAt = Date.now();

    // Update player states
    Object.values(game.players).forEach((player) => {
      player.isCurrentTurn = player.id === game.currentTurn;
    });
  }

  /**
   * Gets the current winner(s) of the game
   */
  getWinners(gameId: string): {
    winners: PlayerGameState[];
    isTie: boolean;
  } | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const players = Object.values(game.players);
    const maxScore = Math.max(...players.map((p) => p.score));
    const winners = players.filter((p) => p.score === maxScore);

    return {
      winners,
      isTie: winners.length > 1,
    };
  }

  /**
   * Generates cards for a new game
   * @param config - Game configuration
   * @returns Array of generated cards
   */
  private generateCards(config: GameConfig): Card[] {
    const cards: Card[] = [];
    let position = 0;

    // Generate card pairs based on difficulty distribution
    Object.entries(config.difficultyDistribution).forEach(
      ([difficulty, count]) => {
        const content = this.cardContent[difficulty as CardDifficulty];
        for (let i = 0; i < count; i++) {
          const pair = content[i % content.length];
          const bugId = uuidv4();
          const solutionId = uuidv4();

          // Create bug card
          cards.push({
            id: bugId,
            type: 'bug',
            content: pair.bug,
            difficulty: difficulty as CardDifficulty,
            isFlipped: false,
            isMatched: false,
            matchingCardId: solutionId,
            position: position++,
          });

          // Create solution card
          cards.push({
            id: solutionId,
            type: 'solution',
            content: pair.solution,
            difficulty: difficulty as CardDifficulty,
            isFlipped: false,
            isMatched: false,
            matchingCardId: bugId,
            position: position++,
          });
        }
      },
    );

    // Shuffle the cards
    return this.shuffleCards(cards);
  }

  /**
   * Calculates score based on card difficulty
   * @param difficulty - Difficulty of the card
   * @returns Score value
   */
  private calculateScore(difficulty: CardDifficulty): number {
    const scoreMap = {
      easy: 10,
      medium: 20,
      hard: 30,
    };
    return scoreMap[difficulty];
  }

  /**
   * Shuffles an array of cards
   * @param cards - Array of cards to shuffle
   * @returns Shuffled array of cards
   */
  private shuffleCards(cards: Card[]): Card[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      // Update positions after shuffle
      shuffled[i].position = i;
      shuffled[j].position = j;
    }
    return shuffled;
  }
}
