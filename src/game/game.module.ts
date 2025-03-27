import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

/**
 * Module for handling game-related functionality
 */
@Module({
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
