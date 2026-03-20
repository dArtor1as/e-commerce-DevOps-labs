import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [FilmsController],
  providers: [FilmsService, TmdbService],
  imports: [DatabaseModule],
  exports: [FilmsService],
})
export class FilmsModule {}
