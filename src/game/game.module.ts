import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AiService } from '../ai/ai.service';

/**
 * Module for handling game-related functionality
 */
@Module({
  providers: [GameService, GameGateway, AiService],
  exports: [GameService],
})
export class GameModule {}
