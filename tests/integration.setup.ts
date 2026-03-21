// integration.setup.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

console.log('AppModule path:', require.resolve('../src/app.module'));
console.log(
  'DatabaseService path:',
  require.resolve('../src/database/database.service'),
);
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

beforeEach(async () => {
  // Очищення таблиць перед кожним тестом
  await prisma.movie.deleteMany({});
  await prisma.$executeRaw`TRUNCATE TABLE "RelatedTable" CASCADE;`;
});
// await prisma.movie.deleteMany();

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "movie" CASCADE;`; // Видалення всіх даних з каскадним очищенням
  await prisma.$disconnect();
  await app.close();
});

export { app, prisma };
