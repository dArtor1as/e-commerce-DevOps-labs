import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async () => {
  await prisma.$executeRawUnsafe(
    'DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
  );
  await prisma.$disconnect();
};
