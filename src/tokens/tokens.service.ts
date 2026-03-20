import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TokensService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Створення нового токена
  async createToken(userId: number, token: string, expiresAt: Date) {
    return this.databaseService.token.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  // Перевірка валідності токена
  async validateToken(token: string) {
    const storedToken = await this.databaseService.token.findUnique({
      where: { token },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      new Date() > storedToken.expiresAt
    ) {
      return false;
    }

    return true;
  }

  // Відкликання токена
  async revokeToken(token: string) {
    return this.databaseService.token.update({
      where: { token },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }
  async revokeAllTokensForUser(userId: number) {
    return this.databaseService.token.updateMany({
      where: { userId, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  // Видалення прострочених токенів
  async cleanUpExpiredTokens() {
    return this.databaseService.token.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
