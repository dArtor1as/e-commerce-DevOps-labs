import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@Injectable()
export class FilmsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tmdbService: TmdbService,
  ) {}

  async findAll(
    genre?: string,
    title?: string,
  ): Promise<{ id: number; title: string; genre: string[] }[]> {
    const whereClause: Record<string, unknown> = {};

    if (genre) {
      whereClause.genre = { has: genre };
    }

    if (title) {
      whereClause.title = { contains: title, mode: 'insensitive' };
    }

    return this.databaseService.movie.findMany({ where: whereClause });
  }

  async findAllGenres(): Promise<string[]> {
    const films = await this.databaseService.movie.findMany();
    const genres = new Set<string>();
    films.forEach((film) => film.genre.forEach((g) => genres.add(g)));
    return Array.from(genres);
  }

  // Отримання конкретного фільму за ID
  async findOne(id: number): Promise<{
    id: number;
    title: string;
    posterPath: string;
    genre: string[];
    releaseYear: number;
    averageRating: number;
    userRating: number;
    ratings: { value: number }[];
  }> {
    const movie = await this.databaseService.movie.findUnique({
      where: { id },
      include: {
        ratings: true, // Включаємо всі рейтинги для фільму
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    const userRatings = movie.ratings.map((rating) => rating.value);
    const userRating =
      userRatings.length > 0
        ? userRatings.reduce((sum, rating) => sum + rating, 0) /
          userRatings.length
        : 0;

    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      genre: movie.genre,
      releaseYear: movie.releaseYear,
      averageRating: movie.averageRating,
      userRating,
      ratings: movie.ratings,
    };
  }

  // Додавання нового фільму
  async create(
    createFilmDto: CreateFilmDto,
  ): Promise<{ id: number; title: string; genre: string[] }> {
    return this.databaseService.movie.create({
      data: {
        tmdbId: Number(createFilmDto.tmdbId),
        title: createFilmDto.title,
        posterPath: createFilmDto.posterPath,
        genre: createFilmDto.genre,
        releaseYear: createFilmDto.releaseYear,
        averageRating: createFilmDto.averageRating ?? 0,
      },
      select: { id: true, title: true, genre: true },
    });
  }

  // Оновлення фільму
  async update(
    id: number,
    updateFilmDto: UpdateFilmDto,
  ): Promise<{ id: number; title: string; genre: string[] }> {
    const existingMovie = await this.findOne(id);
    return this.databaseService.movie.update({
      where: { id },
      data: {
        title: updateFilmDto.title ?? existingMovie.title,
        posterPath: updateFilmDto.posterPath ?? existingMovie.posterPath,
        genre: updateFilmDto.genre ?? existingMovie.genre,
        releaseYear: updateFilmDto.releaseYear ?? existingMovie.releaseYear,
        averageRating:
          updateFilmDto.averageRating ?? existingMovie.averageRating,
      },
      select: { id: true, title: true, genre: true },
    });
  }

  // Видалення фільму
  async delete(id: number): Promise<{ id: number; title: string }> {
    await this.findOne(id);
    return this.databaseService.movie.delete({
      where: { id },
      select: { id: true, title: true },
    });
  }

  // Отримання даних про фільм з TMDB API
  async findOneByTmdbId(
    tmdbId: number,
  ): Promise<{ id: number; title: string; genre: string[] }> {
    const existingMovie = await this.databaseService.movie.findUnique({
      where: { tmdbId },
      select: { id: true, title: true, genre: true },
    });
    if (existingMovie) {
      return existingMovie;
    }

    const movieData = await this.tmdbService.fetchMovieFromTMDB(tmdbId);
    return this.databaseService.movie.create({
      data: {
        tmdbId,
        title: movieData.title,
        posterPath: movieData.posterPath,
        genre: movieData.genre,
        releaseYear: movieData.releaseYear,
        averageRating: movieData.averageRating,
      },
      select: { id: true, title: true, genre: true },
    });
  }
}
