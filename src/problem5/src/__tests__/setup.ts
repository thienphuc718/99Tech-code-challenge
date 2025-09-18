import { execSync } from 'child_process';
import { unlinkSync } from 'fs';
import { join } from 'path';

describe('Test Setup', () => {
  it('should configure test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  try {
    const dbPath = join(process.cwd(), 'prisma', 'test.db');
    unlinkSync(dbPath);
  } catch (error) {
    // Database file might not exist, that's fine
  }

  try {
    execSync('pnpm run db:push --accept-data-loss', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Database push failed, continuing with existing database');
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

beforeEach(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.user.deleteMany();
  await prisma.$disconnect();
});