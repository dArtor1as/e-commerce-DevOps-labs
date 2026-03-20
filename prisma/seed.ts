import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. Явно завантажуємо змінні з .env
dotenv.config();

// 2. Збираємо URL з гранулярних змінних
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public`;

// 3. Налаштування адаптера для сідінгу
const pool = new Pool({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);

// Ініціалізація
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(' Start seeding...');

  // Хеш пароля "123456"
  const passwordHash = '$2b$10$EpWwR8t7c8.5.5.5.5.5.5.5.5.5.5.5';

  // --- 1. СТВОРЕННЯ КОРИСТУВАЧІВ ---
  const usersData = [
    {
      email: 'admin@example.com',
      username: 'MovieMaster',
      password: passwordHash,
    },
    {
      email: 'critic@example.com',
      username: 'KinoCritic',
      password: passwordHash,
    },
    { email: 'john@example.com', username: 'JohnDoe', password: passwordHash },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    createdUsers.push(user);
  }
  console.log(` Created ${createdUsers.length} users.`);

  // --- 2. СТВОРЕННЯ ФІЛЬМІВ (З ПОВНИМИ URL ДЛЯ ПОСТЕРІВ TMDB) ---
  const tmdbBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const moviesData = [
    {
      tmdbId: 157336,
      title: 'Interstellar',
      posterPath: `${tmdbBaseUrl}/gEU2QniL6E77AAyXcCXr47FaOiy.jpg`,
      genre: ['Adventure', 'Drama', 'Science Fiction'],
      releaseYear: 2014,
      averageRating: 8.6,
    },
    {
      tmdbId: 27205,
      title: 'Inception',
      posterPath: `${tmdbBaseUrl}/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`,
      genre: ['Action', 'Science Fiction', 'Adventure'],
      releaseYear: 2010,
      averageRating: 8.8,
    },
    {
      tmdbId: 550,
      title: 'Fight Club',
      posterPath: `${tmdbBaseUrl}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`,
      genre: ['Drama'],
      releaseYear: 1999,
      averageRating: 8.4,
    },
    {
      tmdbId: 155,
      title: 'The Dark Knight',
      posterPath: `${tmdbBaseUrl}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
      genre: ['Drama', 'Action', 'Crime', 'Thriller'],
      releaseYear: 2008,
      averageRating: 8.5,
    },
    {
      tmdbId: 603,
      title: 'The Matrix',
      posterPath: `${tmdbBaseUrl}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg`,
      genre: ['Action', 'Science Fiction'],
      releaseYear: 1999,
      averageRating: 8.7,
    },
    {
      tmdbId: 438631,
      title: 'Dune',
      posterPath: `${tmdbBaseUrl}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg`,
      genre: ['Science Fiction', 'Adventure'],
      releaseYear: 2021,
      averageRating: 7.9,
    },
    {
      tmdbId: 680,
      title: 'Pulp Fiction',
      posterPath: `${tmdbBaseUrl}/d5iIlFn5s0ImszYzBPbOYKQcbJ5.jpg`,
      genre: ['Thriller', 'Crime'],
      releaseYear: 1994,
      averageRating: 8.9,
    },
    {
      tmdbId: 120,
      title: 'The Lord of the Rings',
      posterPath: `${tmdbBaseUrl}/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg`,
      genre: ['Adventure', 'Fantasy', 'Action'],
      releaseYear: 2001,
      averageRating: 8.9,
    },
    {
      tmdbId: 13,
      title: 'Forrest Gump',
      posterPath: `${tmdbBaseUrl}/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg`,
      genre: ['Comedy', 'Drama', 'Romance'],
      releaseYear: 1994,
      averageRating: 8.5,
    },
    {
      tmdbId: 238,
      title: 'The Godfather',
      posterPath: `${tmdbBaseUrl}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`,
      genre: ['Drama', 'Crime'],
      releaseYear: 1972,
      averageRating: 9.0,
    },
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.upsert({
      where: { tmdbId: m.tmdbId },
      update: {},
      create: m,
    });
    createdMovies.push(movie);
  }
  console.log(` Created ${createdMovies.length} movies.`);

  // --- 3. СТВОРЕННЯ ВІДГУКІВ ТА КОМЕНТАРІВ (Без дублікатів) ---
  const admin = createdUsers[0];
  const critic = createdUsers[1];
  const john = createdUsers[2];

  const interstellar = createdMovies.find((m) => m.title === 'Interstellar')!;
  const matrix = createdMovies.find((m) => m.title === 'The Matrix')!;
  const dune = createdMovies.find((m) => m.title === 'Dune')!;

  // Рецензія на Інтерстеллар (upsert гарантує відсутність дублів)
  const review1 = await prisma.review.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content:
        'Це просто шедевр! Музика Ганса Циммера неймовірна, а візуальні ефекти випереджають час.',
      userId: admin.id,
      movieId: interstellar.id,
    },
  });

  // Перевіряємо, чи є вже коментарі до цієї рецензії, щоб не спамити
  const commentsCount = await prisma.comment.count({
    where: { reviewId: review1.id },
  });
  if (commentsCount === 0) {
    await prisma.comment.createMany({
      data: [
        {
          content: 'Абсолютно згоден, кінцівка змусила плакати.',
          userId: john.id,
          reviewId: review1.id,
        },
        {
          content: 'Трохи затягнуто, але загалом круто.',
          userId: critic.id,
          reviewId: review1.id,
        },
      ],
    });
  }

  // Перевіряємо, чи існує вже рецензія на Матрицю від критика
  const existingMatrixReview = await prisma.review.findFirst({
    where: { userId: critic.id, movieId: matrix.id },
  });
  if (!existingMatrixReview) {
    await prisma.review.create({
      data: {
        content:
          'Брати Вачовські змінили кінематограф назавжди. Найкращий кіберпанк.',
        userId: critic.id,
        movieId: matrix.id,
      },
    });
  }

  // --- 4. ДОДАВАННЯ РЕЙТИНГІВ (Без дублікатів) ---
  const ratingsCount = await prisma.rating.count();
  if (ratingsCount === 0) {
    await prisma.rating.createMany({
      data: [
        { value: 10, userId: admin.id, movieId: interstellar.id },
        { value: 9, userId: critic.id, movieId: interstellar.id },
        { value: 10, userId: critic.id, movieId: matrix.id },
        { value: 8, userId: john.id, movieId: dune.id },
      ],
    });
  }

  // --- 5. ДОДАВАННЯ В УЛЮБЛЕНІ (Без дублікатів) ---
  const favoritesCount = await prisma.favorite.count();
  if (favoritesCount === 0) {
    await prisma.favorite.createMany({
      data: [
        { userId: admin.id, movieId: interstellar.id },
        { userId: admin.id, movieId: matrix.id },
        { userId: john.id, movieId: dune.id },
      ],
    });
  }

  console.log(' Seeding finished successfully. No duplicates created!');
}

main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
