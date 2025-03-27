import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

/**
 * Gateway for handling real-time game-related WebSocket events
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  private readonly CARD_FLIP_DELAY = 3000; // 3 seconds delay

  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {}

  /**
   * Handles game initialization when all players are ready
   */
  @SubscribeMessage('game:init')
  handleGameInit(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        roomCode: string;
        players: { id: string; nickname: string }[];
      };
    },
  ): void {
    console.log('Initializing game:', payload);

    const gameState = this.gameService.createGame(
      payload.data.roomCode,
      payload.data.players,
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

    // Emit initial game state to all players
    this.server.to(payload.data.roomCode).emit('game:started', {
      event: 'game:started',
      data: gameState,
    });
  }

  /**
   * Handles card flip events
   */
  @SubscribeMessage('game:flipCard')
  handleCardFlip(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        gameId: string;
        cardId: string;
      };
    },
  ): void {
    console.log('Card flip:', payload);

    const result = this.gameService.handleCardFlip(
      payload.data.gameId,
      client.id,
      payload.data.cardId,
    );

    if (!result) {
      client.emit('game:error', {
        event: 'game:error',
        data: {
          message: 'Invalid game ID',
        },
      });
      return;
    }

    const { gameState, action } = result;

    switch (action) {
      case 'error':
        client.emit('game:error', {
          event: 'game:error',
          data: {
            message:
              'Invalid move. It might not be your turn or the card is already flipped.',
          },
        });
        break;

      case 'flip':
        // Emit card flipped event
        this.server.to(gameState.roomCode).emit('game:cardFlipped', {
          event: 'game:cardFlipped',
          data: {
            gameState,
            cardId: payload.data.cardId,
            playerId: client.id,
          },
        });
        break;

      case 'match':
        // Emit match found event
        this.server.to(gameState.roomCode).emit('game:match', {
          event: 'game:match',
          data: {
            gameState,
            playerId: client.id,
            matchedCards: [
              gameState.firstFlippedCard,
              gameState.secondFlippedCard,
            ],
            message: `${gameState.players[client.id].nickname} found a match! They get another turn.`,
          },
        });

        // Check if game is over
        if (gameState.status === 'finished') {
          const result = this.gameService.getWinners(payload.data.gameId);
          if (result) {
            const { winners, isTie } = result;
            this.server.to(gameState.roomCode).emit('game:over', {
              event: 'game:over',
              data: {
                gameState,
                winners,
                isTie,
                message: isTie
                  ? "It's a tie!"
                  : `${winners[0].nickname} wins with ${winners[0].score} points!`,
              },
            });
          }
        }
        break;

      case 'noMatch':
        // Emit no match event
        this.server.to(gameState.roomCode).emit('game:noMatch', {
          event: 'game:noMatch',
          data: {
            gameState,
            playerId: client.id,
            cards: [gameState.firstFlippedCard, gameState.secondFlippedCard],
            message: 'No match! Switching turns...',
          },
        });

        // After CARD_FLIP_DELAY, emit turn change
        setTimeout(() => {
          this.server.to(gameState.roomCode).emit('game:turnChanged', {
            event: 'game:turnChanged',
            data: {
              gameState,
              currentPlayer: {
                id: gameState.currentTurn,
                nickname: gameState.players[gameState.currentTurn].nickname,
              },
              message: `${gameState.players[gameState.currentTurn].nickname}'s turn`,
            },
          });
        }, this.CARD_FLIP_DELAY);
        break;
    }
  }

  /**
   * Handles forfeit game events
   */
  @SubscribeMessage('game:forfeit')
  handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      event: string;
      data: {
        gameId: string;
      };
    },
  ): void {
    // Handle forfeit logic here
    // This could involve ending the game early and declaring the other player as winner
    console.log('Forfeit:', payload);
  }
}
