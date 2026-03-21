import {
  Controller,
  Get,
  ServiceUnavailableException,
  Res,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async checkHealth(@Res() res: Response) {
    try {
      // Робимо легкий пінг бази даних
      await this.db.$queryRawUnsafe('SELECT 1');

      // Якщо БД відповідає, повертаємо 200 OK
      return res.status(200).json({ status: 'ok', database: 'connected' });
    } catch {
      // Якщо застосунок живий, але БД лежить — повертаємо 503
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
        message: 'Database connection failed',
      });
    }
  }
}
