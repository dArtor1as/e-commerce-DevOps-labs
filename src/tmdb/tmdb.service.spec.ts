import { Test, TestingModule } from '@nestjs/testing';
import { TmdbService } from './tmdb.service';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';

// Кажемо Jest зробити фейковий axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TmdbService', () => {
  let service: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbService],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаємо моки після кожного тесту
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchMovieFromTMDB', () => {
    it('should successfully fetch and format movie data', async () => {
      // 1. Готуємо фейкові дані, які нібито повернув TMDB
      const mockTmdbResponse = {
        data: {
          title: 'The Matrix',
          poster_path: '/matrix.jpg',
          genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
          release_date: '1999-03-30',
          vote_average: 8.7,
        },
      };

      // 2. Налаштовуємо axios на повернення цих даних
      mockedAxios.get.mockResolvedValueOnce(mockTmdbResponse);

      // 3. Викликаємо метод
      const result = await service.fetchMovieFromTMDB(603);

      // 4. Перевіряємо, чи правильно відпрацювала логіка сервісу
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        tmdbId: 603,
        title: 'The Matrix',
        posterPath: '/matrix.jpg',
        genre: ['Action', 'Sci-Fi'],
        releaseYear: 1999,
        averageRating: 8.7,
      });
    });

    it('should throw NotFoundException on API error', async () => {
      // Створюємо правильний об'єкт AxiosError для нашого моку
      const axiosError = new Error(
        'Request failed with status code 404',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
      axiosError.isAxiosError = true;
      // Додаємо властивості, які зазвичай є у справжнього AxiosError

      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(service.fetchMovieFromTMDB(999999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.fetchMovieFromTMDB(999999)).rejects.toThrow(
        'Failed to fetch movie data from TMDB: Request failed with status code 404',
      );
    });
  });
});
