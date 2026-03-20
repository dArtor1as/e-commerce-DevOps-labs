import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [FavouritesController],
  providers: [FavouritesService, DatabaseService],
})
export class FavouritesModule {}
