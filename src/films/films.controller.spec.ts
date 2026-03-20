import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { DatabaseService } from '../database/database.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let tmdbService: TmdbService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: DatabaseService,
          useValue: {
            movie: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                title: 'New Movie',
                genre: ['Action'],
              }),
            },
          },
        },
        {
          provide: TmdbService,
          useValue: {
            fetchMovieFromTMDB: jest.fn(),
          },
        },
        {
          provide: FilmsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    tmdbService = module.get<TmdbService>(TmdbService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFilm', () => {
    it('should create and return a new film', async () => {
      (tmdbService.fetchMovieFromTMDB as jest.Mock).mockResolvedValue({
        title: 'New Movie',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
      });

      const result = await controller.createFilm(123);

      expect(tmdbService.fetchMovieFromTMDB).toHaveBeenCalledWith(123);
      expect(result).toEqual({
        id: 1,
        title: 'New Movie',
        genre: ['Action'],
      });
    });

    it('should throw BadRequestException for invalid TMDB ID', async () => {
      await expect(
        controller.createFilm('invalid' as unknown as number),
      ).rejects.toThrow('Invalid TMDB ID');
    });

    it('should throw NotFoundException if TMDB service returns null', async () => {
      (tmdbService.fetchMovieFromTMDB as jest.Mock).mockResolvedValue(null);

      await expect(controller.createFilm(123)).rejects.toThrow(
        'No data found for TMDB ID: 123',
      );
    });

    it('should throw InternalServerErrorException if DatabaseService fails', async () => {
      (tmdbService.fetchMovieFromTMDB as jest.Mock).mockResolvedValue({
        title: 'New Movie',
        posterPath: 'path/to/poster',
        genre: ['Action'],
        releaseYear: 2023,
        averageRating: 4.5,
      });
      (databaseService.movie.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.createFilm(123)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
