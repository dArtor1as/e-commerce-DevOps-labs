import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseService } from '../database/database.service';
import { AuthModule } from '../auth/auth.module'; // Додамо імпорт AuthModule

@Module({
  imports: [ConfigModule, JwtModule.register({}), AuthModule], // Імпортуємо модулі, які містять необхідні сервіси
  controllers: [ReviewsController],
  providers: [ReviewsService, DatabaseService],
})
export class ReviewsModule {}
