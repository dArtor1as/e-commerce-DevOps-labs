import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { TmdbService } from '../src/tmdb/tmdb.service';
import { join } from 'path';

describe('FilmsController (e2e)', () => {
  let app: NestExpressApplication;

  const mockDatabaseService = {
    movie: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Test Film',
          genre: ['Drama', 'Action'],
        },
        {
          id: 2,
          title: 'Another Test Film',
          genre: ['Comedy'],
        },
      ]),
      create: jest.fn().mockResolvedValue({
        id: 3,
        title: 'New Test Film',
        genre: ['Thriller'],
      }),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockTmdbService = {
    fetchMovieFromTMDB: jest.fn().mockResolvedValue({
      tmdbId: 101,
      title: 'Mock TMDB Film',
      posterPath: '/mock-poster.jpg',
      genre: ['Adventure'],
      releaseYear: 2021,
      averageRating: 8.1,
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDatabaseService)
      .overrideProvider(TmdbService)
      .useValue(mockTmdbService)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/films (GET) should return a list of films', async () => {
    const response = await request(app.getHttpServer()).get('/films');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1 class="my-4">Films</h1>');
    expect(response.text).toContain('Test Film');
    expect(response.text).toContain('Another Test Film');
  });

  it('/films (POST) should create a new film', async () => {
    const newFilm = {
      tmdbId: 123,
    };
    const response = await request(app.getHttpServer())
      .post('/films')
      .send(newFilm);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 3,
      title: 'New Test Film',
      genre: ['Thriller'],
    });
  });
});
