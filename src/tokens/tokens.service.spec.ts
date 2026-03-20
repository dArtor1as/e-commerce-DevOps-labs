import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { DatabaseService } from '../database/database.service';

const mockDatabaseService = {
  token: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('TokensService', () => {
  let service: TokensService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should create a token in the database', async () => {
      const date = new Date();
      mockDatabaseService.token.create.mockResolvedValue({ id: 1 });

      await service.createToken(5, 'some-token', date);

      expect(db.token.create).toHaveBeenCalledWith({
        data: { userId: 5, token: 'some-token', expiresAt: date },
      });
    });
  });

  describe('validateToken', () => {
    it('should return true for a valid, unrevoked token', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // +1 година

      mockDatabaseService.token.findUnique.mockResolvedValue({
        token: 'valid',
        revoked: false,
        expiresAt: futureDate,
      });

      expect(await service.validateToken('valid')).toBe(true);
    });

    it('should return false if token is not found', async () => {
      mockDatabaseService.token.findUnique.mockResolvedValue(null);
      expect(await service.validateToken('missing')).toBe(false);
    });

    it('should return false if token is revoked', async () => {
      mockDatabaseService.token.findUnique.mockResolvedValue({
        token: 'revoked-token',
        revoked: true,
        expiresAt: new Date(Date.now() + 10000), // Ще не прострочений, але вже відкликаний
      });
      expect(await service.validateToken('revoked-token')).toBe(false);
    });

    it('should return false if token is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // -1 година

      mockDatabaseService.token.findUnique.mockResolvedValue({
        token: 'expired',
        revoked: false,
        expiresAt: pastDate,
      });
      expect(await service.validateToken('expired')).toBe(false);
    });
  });

  describe('revokeToken', () => {
    it('should update token to be revoked', async () => {
      mockDatabaseService.token.update.mockResolvedValue({ id: 1 });
      await service.revokeToken('token-to-revoke');

      expect(db.token.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'token-to-revoke' },
          data: expect.objectContaining({ revoked: true }),
        }),
      );
    });
  });

  describe('revokeAllTokensForUser', () => {
    it('should revoke all active tokens for a user', async () => {
      mockDatabaseService.token.updateMany.mockResolvedValue({ count: 2 });
      await service.revokeAllTokensForUser(5);

      expect(db.token.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 5, revoked: false },
          data: expect.objectContaining({ revoked: true }),
        }),
      );
    });
  });

  describe('cleanUpExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      mockDatabaseService.token.deleteMany.mockResolvedValue({ count: 5 });
      await service.cleanUpExpiredTokens();

      expect(db.token.deleteMany).toHaveBeenCalled();
    });
  });
});
