import {
  Body,
  Controller,
  Post,
  NotFoundException,
  Get,
  Render,
  Query,
  Param,
} from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { DatabaseService } from '../database/database.service';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly databaseService: DatabaseService,
    private readonly filmsService: FilmsService,
  ) {}

  @Get()
  @Render('films')
  async findAll(
    @Query('genre') genre?: string,
    @Query('title') title?: string,
  ) {
    const films = await this.filmsService.findAll(genre, title);
    const genres = await this.filmsService.findAllGenres(); // Отримання жанрів з бази даних
    return { films, genres };
  }

  @Get(':id')
  @Render('film-details')
  async findOne(@Param('id') id: string) {
    const film = await this.filmsService.findOne(parseInt(id, 10));
    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }
    return { film };
  }

  @Post()
  async createFilm(@Body('tmdbId') tmdbId: number) {
    // console.log(`Received TMDB ID: ${tmdbId}`);

    // Явне приведення tmdbId до числа
    const tmdbIdAsNumber = Number(tmdbId);

    if (isNaN(tmdbIdAsNumber)) {
      throw new NotFoundException(`Invalid TMDB ID: ${tmdbId}`);
    }

    const movieData = await this.tmdbService.fetchMovieFromTMDB(tmdbIdAsNumber);

    if (!movieData) {
      throw new NotFoundException(`No data found for TMDB ID: ${tmdbId}`);
    }

    const newFilm = await this.databaseService.movie.create({
      data: {
        tmdbId: tmdbIdAsNumber, // Передаємо вже як число
        title: movieData.title,
        posterPath: movieData.posterPath,
        genre: movieData.genre,
        releaseYear: movieData.releaseYear,
        averageRating: movieData.averageRating,
      },
    });

    return newFilm;
  }
}
