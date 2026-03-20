import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// 1. Намагаємося прочитати .env (спрацює локально, проігнорується в Docker)
dotenv.config();

// 2. Якщо Docker передав готовий URL - використовуємо його.
// Інакше - збираємо вручну для локального терміналу.
const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`;

export default defineConfig({
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
