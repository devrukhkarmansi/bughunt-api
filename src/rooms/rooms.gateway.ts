import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { GameService } from '../game/game.service';

/**
 * Gateway for handling real-time room-related WebSocket events
 */
@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with actual frontend URL
  },
})
export class RoomsGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly gameService: GameService,
  ) {}

  /**
   * Handles room creation events
   * @param client - Socket client instance
   * @param payload - Room creation data
   */
  @SubscribeMessage('room:create')
  handleRoomCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        nickname: string;
        settings?: any;
      };
    },
  ): void {
    console.log('Creating room with payload:', payload); // Debug log
    console.log('Client ID:', client.id); // Debug log

    const room = this.roomsService.createRoom(
      client.id,
      payload.data.nickname,
      payload.data.settings,
    );

    // Join the socket to the room
    client.join(room.roomCode);

    console.log('Room created:', room); // Debug log

    // Emit to the client directly
    client.emit('room:created', {
      event: 'room:created',
      data: room,
    });

    // Also emit to the room (for future reference)
    this.server.to(room.roomCode).emit('room:updated', {
      event: 'room:updated',
      data: room,
    });
  }

  /**
   * Handles room join events
   * @param client - Socket client instance
   * @param payload - Room join data
   */
  @SubscribeMessage('room:join')
  handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        roomCode: string;
        nickname: string;
      };
    },
  ): void {
    console.log('Joining room with payload:', payload); // Debug log
    const room = this.roomsService.joinRoom(
      payload.data.roomCode,
      client.id,
      payload.data.nickname,
    );

    if (room) {
      client.join(room.roomCode);
      console.log('Room joined:', room); // Debug log

      // Emit to the client that just joined
      client.emit('room:joined', {
        event: 'room:joined',
        data: room,
      });

      // Notify all players that both players are now in the room
      if (Object.keys(room.players).length === 2) {
        this.server.to(room.roomCode).emit('room:full', {
          event: 'room:full',
          data: {
            message: 'Both players have joined! Get ready to start the game.',
            room: room,
          },
        });
      }

      // Emit to all clients in the room
      this.server.to(room.roomCode).emit('room:updated', {
        event: 'room:updated',
        data: room,
      });
    } else {
      client.emit('room:error', {
        event: 'room:error',
        data: {
          message:
            'Failed to join room. Room might be full, invalid, or nickname taken.',
        },
      });
    }
  }

  /**
   * Handles room leave events
   * @param client - Socket client instance
   * @param payload - Room leave data
   */
  @SubscribeMessage('room:leave')
  handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        roomCode: string;
      };
    },
  ): void {
    const room = this.roomsService.leaveRoom(payload.data.roomCode, client.id);

    client.leave(payload.data.roomCode);
    if (room) {
      // Notify remaining player that opponent left
      this.server.to(payload.data.roomCode).emit('room:updated', {
        event: 'room:updated',
        data: {
          ...room,
          message: 'Opponent left the game',
        },
      });
    }
  }

  /**
   * Handles player ready status updates
   * @param client - Socket client instance
   * @param payload - Ready status update data
   */
  @SubscribeMessage('room:ready')
  handlePlayerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        roomCode: string;
        isReady: boolean;
      };
    },
  ): void {
    console.log('Player ready status update:', payload);
    const room = this.roomsService.setPlayerReady(
      payload.data.roomCode,
      client.id,
      payload.data.isReady,
    );

    if (room) {
      // Notify about player ready status
      this.server.to(room.roomCode).emit('room:updated', {
        event: 'room:updated',
        data: room,
      });

      // Check if both players are ready
      const allPlayersReady = Object.values(room.players).every(
        (player) => player.isReady,
      );

      if (allPlayersReady && Object.keys(room.players).length === 2) {
        room.status = 'playing';

        // Emit game start event with initial game state
        this.server.to(room.roomCode).emit('game:start', {
          event: 'game:start',
          data: {
            message: 'Game is starting!',
            room: room,
            // Add any initial game state here
            gameState: {
              currentTurn: room.hostId, // Host goes first
              turnNumber: 1,
              scores: Object.fromEntries(
                Object.keys(room.players).map((playerId) => [playerId, 0]),
              ),
            },
          },
        });
      }
    }
  }

  /**
   * Handles client disconnection
   * @param client - Socket client instance
   */
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    // Find and leave all rooms the client was in
    this.server.sockets.adapter.rooms.forEach((_, roomCode) => {
      const room = this.roomsService.getRoom(roomCode);
      if (room && room.players[client.id]) {
        this.handleRoomLeave(client, {
          event: 'room:leave',
          data: { roomCode },
        });
      }
    });
  }

  /**
   * Handles game start event from the host
   */
  @SubscribeMessage('room:startGame')
  handleGameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        roomCode: string;
      };
    },
  ): void {
    console.log('Starting game:', payload);

    const room = this.roomsService.getRoom(payload.data.roomCode);

    // Verify room exists and client is host
    if (!room || room.hostId !== client.id) {
      client.emit('game:error', {
        event: 'game:error',
        data: {
          message: !room ? 'Room not found' : 'Only host can start the game',
        },
      });
      return;
    }

    // Convert players object to array format needed by GameService
    const players = Object.entries(room.players).map(([id, player]) => ({
      id,
      nickname: player.nickname,
    }));

    // Verify we have exactly 2 players
    if (players.length !== 2) {
      client.emit('game:error', {
        event: 'game:error',
        data: {
          message: 'Need exactly 2 players to start the game',
        },
      });
      return;
    }

    // Initialize game
    const gameState = this.gameService.createGame(
      payload.data.roomCode,
      players,
      {
        numberOfPairs: 6, // 12 cards total
        turnTimeLimit: 30,
        difficultyDistribution: {
          easy: 2,
          medium: 2,
          hard: 2,
        },
      },
    );

    // Emit game started event to all players in room
    this.server.to(payload.data.roomCode).emit('game:started', {
      event: 'game:started',
      data: gameState,
    });
  }
}
