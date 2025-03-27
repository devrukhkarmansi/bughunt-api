import { Card } from './card.entity';

/**
 * Status of the game
 */
export type GameStatus = 'waiting' | 'playing' | 'finished';

/**
 * Represents the current state of a player in the game
 */
export interface PlayerGameState {
  /**
   * Player's ID
   */
  id: string;

  /**
   * Player's nickname
   */
  nickname: string;

  /**
   * Player's current score
   */
  score: number;

  /**
   * Number of matches found by the player
   */
  matchesFound: number;

  /**
   * Whether it's currently this player's turn
   */
  isCurrentTurn: boolean;
}

/**
 * Represents the current state of a game
 */
export interface GameState {
  /**
   * Unique identifier for the game
   */
  gameId: string;

  /**
   * Current status of the game
   */
  status: GameStatus;

  /**
   * Room code associated with this game
   */
  roomCode: string;

  /**
   * Array of cards in the game
   */
  cards: Card[];

  /**
   * Map of player IDs to their game states
   */
  players: Record<string, PlayerGameState>;

  /**
   * ID of the player whose turn it currently is
   */
  currentTurn: string;

  /**
   * Current turn number
   */
  turnNumber: number;

  /**
   * ID of the first card flipped in the current turn
   */
  firstFlippedCard?: string;

  /**
   * ID of the second card flipped in the current turn
   */
  secondFlippedCard?: string;

  /**
   * Timestamp when the game started
   */
  startedAt: number;

  /**
   * Timestamp when the game ended (if finished)
   */
  endedAt?: number;

  /**
   * Time limit for each turn in seconds
   */
  turnTimeLimit: number;

  /**
   * Timestamp when the current turn started
   */
  currentTurnStartedAt: number;
}

/**
 * Configuration for a new game
 */
export interface GameConfig {
  /**
   * Number of card pairs in the game
   */
  numberOfPairs: number;

  /**
   * Time limit for each turn in seconds
   */
  turnTimeLimit: number;

  /**
   * Distribution of card difficulties
   */
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}
