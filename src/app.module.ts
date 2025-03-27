import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';

/**
 * Root module of the application
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RoomsModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
