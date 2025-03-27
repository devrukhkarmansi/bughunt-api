import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { GameModule } from '../game/game.module';

/**
 * Module for handling game room operations
 */
@Module({
  imports: [GameModule],
  providers: [RoomsService, RoomsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
