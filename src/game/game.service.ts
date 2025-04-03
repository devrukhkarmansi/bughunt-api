import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Card, CardDifficulty, CardType } from './entities/card.entity';
import { GameState, GameConfig, PlayerGameState } from './entities/game.entity';

/**
 * Service responsible for managing game logic
 */
@Injectable()
export class GameService {
  private games: Map<string, GameState> = new Map();

  constructor(private readonly aiService: AiService) {}

  /**
   * Creates a new game state
   * @param roomCode - Code of the room
   * @param players - Array of player IDs and nicknames
   * @param config - Game configuration
   * @returns The created game state
   */
  async createGame(
    roomCode: string,
    players: { id: string; nickname: string }[],
    config: GameConfig,
  ): Promise<GameState> {
    // Generate bug-solution pairs using AI
    const pairs = await this.aiService.generateBugSolutionPairs(
      config.numberOfPairs,
    );

    // Create cards from the pairs
    const cards = this.generateCards(pairs);

    const gameState: GameState = {
      gameId: Math.random().toString(36).substring(7),
      status: 'playing',
      roomCode,
      cards,
      players: players.reduce(
        (acc, player) => {
          acc[player.id] = {
            id: player.id,
            nickname: player.nickname,
            score: 0,
            matchesFound: 0,
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
      currentTurn: players[0].id,
      turnNumber: 1,
      firstFlippedCard: null,
      secondFlippedCard: null,
      startedAt: Date.now(),
      turnTimeLimit: config.turnTimeLimit,
      currentTurnStartedAt: Date.now(),
    };

    this.games.set(gameState.gameId, gameState);
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
    console.log('Switching turns');
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
   * Generates cards from bug-solution pairs
   */
  private generateCards(
    pairs: Array<{
      bug: string;
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>,
  ): Card[] {
    const cards: Card[] = [];
    let position = 0;

    pairs.forEach((pair) => {
      const bugId = `card_${position}`;
      const solutionId = `card_${position + 1}`;

      // Create bug card
      cards.push({
        id: bugId,
        type: 'bug' as CardType,
        content: pair.bug,
        difficulty: pair.difficulty,
        isFlipped: false,
        isMatched: false,
        matchingCardId: solutionId,
        position: position++,
      });

      // Create solution card
      cards.push({
        id: solutionId,
        type: 'solution' as CardType,
        content: pair.solution,
        difficulty: pair.difficulty,
        isFlipped: false,
        isMatched: false,
        matchingCardId: bugId,
        position: position++,
      });
    });

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

  /**
   * Handles timer expiration for a player's turn
   */
  handleTimerExpiration(
    gameId: string,
    playerId: string,
  ): {
    gameState: GameState;
    action: 'timeUp';
  } | null {
    console.log('Handling timer expiration');
    console.log('Game ID:', this.games);
    const game = this.games.get(gameId);
    if (!game) {
      console.log('Game not found');
      return null;
    }

    // Validate it's the player's turn
    if (game.currentTurn !== playerId) {
      console.log("Not the player's turn");
      return null;
    }
    console.log('It is the player turn');

    // If there's a flipped card, flip it back
    if (game.firstFlippedCard) {
      console.log('There is a flipped card');
      const firstCard = game.cards.find((c) => c.id === game.firstFlippedCard);
      if (firstCard) {
        console.log('Flipping back the card');
        firstCard.isFlipped = false;
      }
      game.firstFlippedCard = null;
    }

    // Switch turns
    this.switchTurns(game);

    console.log('Game state updated :', game);

    return {
      gameState: game,
      action: 'timeUp',
    };
  }
}
