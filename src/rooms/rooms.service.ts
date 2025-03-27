import { Injectable } from '@nestjs/common';
import {
  GameRoom,
  Player,
  GameSettings,
} from '../common/interfaces/room.interface';

/**
 * Service responsible for managing game rooms
 */
@Injectable()
export class RoomsService {
  private rooms: Map<string, GameRoom> = new Map();

  /**
   * Creates a new game room
   * @param hostId - ID of the player creating the room
   * @param nickname - Nickname of the host player
   * @param settings - Optional room settings
   * @returns The created game room
   */
  createRoom(
    hostId: string,
    nickname: string,
    settings?: Partial<GameSettings>,
  ): GameRoom {
    console.log('Creating room with hostId:', hostId);
    console.log('Nickname:', nickname);
    console.log('Settings:', settings);
    const roomCode = this.generateRoomCode();
    const host: Player = {
      id: hostId,
      nickname: nickname,
      isReady: false,
      isHost: true,
      joinedAt: Date.now(),
    };

    const room: GameRoom = {
      roomCode,
      hostId,
      players: { [hostId]: host },
      status: 'waiting',
      maxPlayers: 2,
      createdAt: Date.now(),
      settings: {
        turnTimeLimit: 30,
        allowSpectators: false,
        isPrivate: false,
        ...settings,
      },
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  /**
   * Adds a player to a room
   * @param roomCode - Code of the room to join
   * @param playerId - ID of the joining player
   * @param nickname - Nickname of the joining player
   * @returns The updated game room or null if room not found
   */
  joinRoom(
    roomCode: string,
    playerId: string,
    nickname: string,
  ): GameRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (Object.keys(room.players).length >= room.maxPlayers) {
      return null;
    }

    // Check if nickname is already taken in the room
    const isNicknameTaken = Object.values(room.players).some(
      (player) => player.nickname === nickname,
    );
    if (isNicknameTaken) return null;

    const player: Player = {
      id: playerId,
      nickname: nickname,
      isReady: false,
      isHost: false,
      joinedAt: Date.now(),
    };

    room.players[playerId] = player;
    return room;
  }

  /**
   * Removes a player from a room
   * @param roomCode - Code of the room
   * @param playerId - ID of the player to remove
   * @returns The updated game room or null if room not found
   */
  leaveRoom(roomCode: string, playerId: string): GameRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    delete room.players[playerId];

    // If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    // If host left, assign new host
    if (playerId === room.hostId) {
      const newHost = Object.values(room.players)[0];
      room.hostId = newHost.id;
      room.players[newHost.id].isHost = true;
    }

    return room;
  }

  /**
   * Retrieves a room by its code
   * @param roomCode - Code of the room to retrieve
   * @returns The game room or null if not found
   */
  getRoom(roomCode: string): GameRoom | null {
    return this.rooms.get(roomCode) || null;
  }

  /**
   * Updates player ready status in a room
   * @param roomCode - Code of the room
   * @param playerId - ID of the player
   * @param isReady - New ready status
   * @returns The updated game room or null if room not found
   */
  setPlayerReady(
    roomCode: string,
    playerId: string,
    isReady: boolean,
  ): GameRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.players[playerId]) return null;

    room.players[playerId].isReady = isReady;
    return room;
  }

  /**
   * Generates a unique room code
   * @returns A 6-character room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
    } while (this.rooms.has(code));

    return code;
  }
}
