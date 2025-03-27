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
  status: 'waiting' | 'playing' | 'finished';

  /**
   * ID of the player whose turn it currently is
   */
  currentTurn: string;

  /**
   * Array of cards on the game board
   */
  board: Card[];

  /**
   * Record of player scores
   */
  scores: Record<string, number>;

  /**
   * Current timer value in seconds
   */
  timer: number;
}

/**
 * Represents a card in the game
 */
export interface Card {
  /**
   * Unique identifier for the card
   */
  id: string;

  /**
   * Type of the card (bug or solution)
   */
  type: 'bug' | 'solution';

  /**
   * Content displayed on the card
   */
  content: string;

  /**
   * Whether the card is currently flipped
   */
  isFlipped: boolean;

  /**
   * Whether the card has been matched
   */
  isMatched: boolean;
}
