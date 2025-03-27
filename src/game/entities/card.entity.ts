/**
 * Type of card in the game
 */
export type CardType = 'bug' | 'solution';

/**
 * Difficulty level of the card
 */
export type CardDifficulty = 'easy' | 'medium' | 'hard';

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
  type: CardType;

  /**
   * Content displayed on the card
   */
  content: string;

  /**
   * Difficulty level of the card
   */
  difficulty: CardDifficulty;

  /**
   * Whether the card is currently flipped
   */
  isFlipped: boolean;

  /**
   * Whether the card has been matched
   */
  isMatched: boolean;

  /**
   * ID of the matching card (for bug-solution pairs)
   */
  matchingCardId: string;

  /**
   * Position in the grid (0-based index)
   */
  position: number;
}

/**
 * Represents a pair of matching cards
 */
export interface CardPair {
  /**
   * The bug card in the pair
   */
  bug: Card;

  /**
   * The solution card in the pair
   */
  solution: Card;
}
