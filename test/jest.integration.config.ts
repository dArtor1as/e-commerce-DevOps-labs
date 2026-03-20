import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testRegex: 'test/integration/.*\\.integration\\.spec\\.ts$', // Тестові файли для інтеграційних тестів
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/integration.setup.ts'],
};

export default config;
