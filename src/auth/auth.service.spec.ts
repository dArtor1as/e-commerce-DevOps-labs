import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokensService } from 'src/tokens/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

// Мокаємо bcryptjs
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokensService,
          useValue: {
            generateTokens: jest.fn(),
            verifyToken: jest.fn(),
            createToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: {
            user: { findUnique: jest.fn(), create: jest.fn() },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock-value') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user object if validation is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        username: 'tester',
        password: 'hashedPassword',
      };

      // Імітуємо, що БД знайшла користувача
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      // Імітуємо, що паролі співпали
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        username: 'tester',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // БД не знаходить користувача
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validateUser('wrong@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        username: 'tester',
        password: 'hashedPassword',
      };
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Імітуємо невірний пароль
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@test.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // БД каже, що такого email та username ще немає
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const createdUser = {
        id: 1,
        email: 'new@test.com',
        username: 'newuser',
        password: 'hashedPassword',
      };
      (databaseService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.register(
        'new@test.com',
        'password123',
        'newuser',
      );

      expect(result.message).toEqual('User successfully registered');
      expect(result.user).toEqual(createdUser);
      expect(databaseService.user.create).toHaveBeenCalled(); // Перевіряємо, чи викликалось створення в БД
    });

    it('should throw BadRequestException if email already exists', async () => {
      // БД знаходить існуючого користувача з таким email
      (databaseService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
      });

      await expect(
        service.register('exist@test.com', 'pass', 'user'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
