import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { DatabaseService } from '../database/database.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { NotFoundException } from '@nestjs/common';

const mockDatabaseService = {
  movie: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockTmdbService = {
  fetchMovieFromTMDB: jest.fn(),
};

describe('FilmsService', () => {
  let service: FilmsService;
  let databaseService: typeof mockDatabaseService;
  let tmdbService: typeof mockTmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: TmdbService, useValue: mockTmdbService },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    databaseService = module.get(DatabaseService);
    tmdbService = module.get(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', genre: ['Action'] },
        { id: 2, title: 'Movie 2', genre: ['Drama'] },
      ];
      databaseService.movie.findMany.mockResolvedValue(mockMovies);

      const result = await service.findAll();

      expect(result).toEqual(mockMovies);
      expect(databaseService.movie.findMany).toHaveBeenCalledWith({
        where: {},
      });
    });

    it('should filter movies by genre and title', async () => {
      const mockMovies = [{ id: 1, title: 'Movie 1', genre: ['Action'] }];
      databaseService.movie.findMany.mockResolvedValue(mockMovies);

      const result = await service.findAll('Action', 'Movie 1');

      expect(result).toEqual(mockMovies);
      expect(databaseService.movie.findMany).toHaveBeenCalledWith({
        where: {
          genre: { has: 'Action' },
          title: { contains: 'Movie 1', mode: 'insensitive' },
        },
      });
    });
  });

  describe('findAllGenres', () => {
    it('should return all unique genres', async () => {
      const mockMovies = [
        { genre: ['Action', 'Comedy'] },
        { genre: ['Drama', 'Action'] },
      ];
      databaseService.movie.findMany.mockResolvedValue(mockMovies);

      const result = await service.findAllGenres();

      expect(result).toEqual(['Action', 'Comedy', 'Drama']);
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      const mockMovie = {
        id: 1,
        title: 'Movie 1',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2021,
        averageRating: 4.5,
        ratings: [{ value: 5 }, { value: 4 }],
      };
      databaseService.movie.findUnique.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        title: 'Movie 1',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2021,
        averageRating: 4.5,
        userRating: 4.5,
        ratings: mockMovie.ratings,
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      databaseService.movie.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const createFilmDto = {
        tmdbId: 123,
        title: 'New Movie',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
      };
      const mockCreatedMovie = {
        id: 1,
        title: 'New Movie',
        genre: ['Action'],
      };
      databaseService.movie.create.mockResolvedValue(mockCreatedMovie);

      const result = await service.create(createFilmDto);

      expect(result).toEqual(mockCreatedMovie);
      expect(databaseService.movie.create).toHaveBeenCalledWith({
        data: {
          tmdbId: 123,
          title: 'New Movie',
          posterPath: 'path/to/poster',
          genre: ['Action'],
          releaseYear: 2023,
          averageRating: 4.5,
        },
        select: { id: true, title: true, genre: true },
      });
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const updateFilmDto = {
        title: 'Updated Movie',
      };

      const mockExistingMovie = {
        id: 1,
        title: 'Old Movie',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
        ratings: [], // Додано для відповідності повертаємому значенню `findOne`
      };

      const mockUpdatedMovie = {
        id: 1,
        title: 'Updated Movie',
        genre: ['Action'],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...mockExistingMovie,
        userRating: 4.5,
      }); // Указано точне значення, яке повертається сервісом

      databaseService.movie.update.mockResolvedValue(mockUpdatedMovie);

      const result = await service.update(1, updateFilmDto);

      expect(result).toEqual(mockUpdatedMovie);
      expect(databaseService.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated Movie',
          posterPath: 'path/to/poster',
          genre: ['Action'],
          releaseYear: 2023,
          averageRating: 4.5,
        },
        select: { id: true, title: true, genre: true },
      });
    });
  });

  describe('delete', () => {
    it('should delete a movie by ID', async () => {
      const mockMovie = {
        id: 1,
        title: 'Movie 1',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
        ratings: [], // Додано для відповідності повертаємому значенню `findOne`
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...mockMovie,
        userRating: 4.5,
      }); // Указано точне значення, яке повертається сервісом

      databaseService.movie.delete.mockResolvedValue({
        id: 1,
        title: 'Movie 1',
      });

      const result = await service.delete(1);

      expect(result).toEqual({
        id: 1,
        title: 'Movie 1',
      });

      expect(databaseService.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, title: true },
      });
    });
  });

  describe('findOneByTmdbId', () => {
    it('should return an existing movie by TMDB ID', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', genre: ['Action'] };
      databaseService.movie.findUnique.mockResolvedValue(mockMovie);

      const result = await service.findOneByTmdbId(123);

      expect(result).toEqual(mockMovie);
    });

    it('should handle movies with no genres', async () => {
      const mockMovies = [{ id: 1, title: 'Movie 1', genre: [] }];
      databaseService.movie.findMany.mockResolvedValue(mockMovies);

      const result = await service.findAll();

      expect(result).toEqual(mockMovies);
    });
  });

  describe('edge cases', () => {
    it('should handle an empty database when finding all movies', async () => {
      databaseService.movie.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should fetch and create a movie from TMDB if not found', async () => {
      const mockMovieData = {
        title: 'New Movie',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
      };
      const mockCreatedMovie = {
        id: 1,
        title: 'New Movie',
        genre: ['Action'],
      };
      databaseService.movie.findUnique.mockResolvedValue(null);
      tmdbService.fetchMovieFromTMDB.mockResolvedValue(mockMovieData);
      databaseService.movie.create.mockResolvedValue(mockCreatedMovie);

      const result = await service.findOneByTmdbId(123);

      expect(result).toEqual(mockCreatedMovie);
      expect(tmdbService.fetchMovieFromTMDB).toHaveBeenCalledWith(123);
      expect(databaseService.movie.create).toHaveBeenCalledWith({
        data: {
          tmdbId: 123,
          title: 'New Movie',
          posterPath: 'path/to/poster',
          genre: ['Action'],
          releaseYear: 2023,
          averageRating: 4.5,
        },
        select: { id: true, title: true, genre: true },
      });
    });
    describe('mock errors', () => {
      it('should handle TMDB API errors gracefully', async () => {
        tmdbService.fetchMovieFromTMDB.mockRejectedValue(
          new Error('TMDB API error'),
        );

        await expect(service.findOneByTmdbId(123)).rejects.toThrow(
          'TMDB API error',
        );
      });

      it('should handle database timeout errors', async () => {
        databaseService.movie.findMany.mockRejectedValue(
          new Error('Database timeout'),
        );

        await expect(service.findAll()).rejects.toThrow('Database timeout');
      });
    });
  });
});
