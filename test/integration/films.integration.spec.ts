// films.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';

describe('Films Integration Tests', () => {
  let app: INestApplication;
  let prisma: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(DatabaseService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.movie.deleteMany(); // Очистка таблиці після тестів
    await prisma.$disconnect();
    await app.close();
  });

  describe('/films (GET)', () => {
    it('should return a list of films', async () => {
      // Створимо тестові дані
      await prisma.movie.createMany({
        data: [
          {
            title: 'Inception',
            genre: ['Sci-Fi'],
            releaseYear: 2010,
            tmdbId: 1001,
          },
          {
            title: 'Interstellar',
            genre: ['Sci-Fi', 'Drama'],
            releaseYear: 2014,
            tmdbId: 1002,
          },
        ],
      });

      const response = await request(app.getHttpServer()).get('/films');
      expect(response.status).toBe(200); // Для успішного виконання
      expect(response.body).toBeDefined();
      expect(response.body.films).toHaveLength(2);
      expect(response.body.films[0]).toMatchObject({ title: 'Inception' });
    });
  });

  describe('/films/:id (GET)', () => {
    it('should return a specific film', async () => {
      // Створимо тестовий фільм
      const movie = await prisma.movie.create({
        data: {
          title: 'Tenet',
          genre: ['Sci-Fi'],
          releaseYear: 2020,
          tmdbId: 3,
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/films/${movie.id}`,
      );
      expect(response.status).toBe(200); // Для успішного виконання
      expect(response.body).toBeDefined();
      expect(response.body.film).toMatchObject({
        title: 'Tenet',
        genre: ['Sci-Fi'],
      });
    });

    it('should return 404 if film not found', async () => {
      const response = await request(app.getHttpServer()).get('/films/999');
      expect(response.status).toBe(404);
    });
  });

  describe('/films (POST)', () => {
    it('should create a new film', async () => {
      const tmdbId = 12345; // Наприклад, ID фільму в TMDB
      const response = await request(app.getHttpServer())
        .post('/films')
        .send({ tmdbId });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: expect.any(String),
        genre: expect.any(Array),
      });

      // Перевірка створення в базі даних
      const createdFilm = await prisma.movie.findUnique({
        where: { tmdbId },
      });
      expect(createdFilm).not.toBeNull();
    });

    it('should return 404 if TMDB ID is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/films')
        .send({ tmdbId: -1 });

      expect(response.status).toBe(404);
    });
  });
});
