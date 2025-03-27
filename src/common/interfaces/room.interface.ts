/**
 * Represents a player in a game room
 */
export interface Player {
  /**
   * Unique identifier for the player
   */
  id: string;

  /**
   * Player's chosen nickname
   */
  nickname: string;

  /**
   * Whether the player is ready to start the game
   */
  isReady: boolean;

  /**
   * Whether the player is the host of the room
   */
  isHost: boolean;

  /**
   * Timestamp when the player joined
   */
  joinedAt: number;
}

/**
 * Game room settings configuration
 */
export interface GameSettings {
  /**
   * Time limit for each turn in seconds
   */
  turnTimeLimit: number;

  /**
   * Whether spectators are allowed in the room
   */
  allowSpectators: boolean;

  /**
   * Whether the room is private (requires code to join)
   */
  isPrivate: boolean;
}

/**
 * Represents a game room
 */
export interface GameRoom {
  /**
   * Unique room code for joining
   */
  roomCode: string;

  /**
   * ID of the host player
   */
  hostId: string;

  /**
   * Map of players in the room
   */
  players: Record<string, Player>;

  /**
   * Current status of the room
   */
  status: 'waiting' | 'playing' | 'finished';

  /**
   * Maximum number of players allowed
   */
  maxPlayers: number;

  /**
   * Room creation timestamp
   */
  createdAt: number;

  /**
   * Room configuration settings
   */
  settings: GameSettings;
}
