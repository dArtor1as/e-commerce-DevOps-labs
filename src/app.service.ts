import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  // NestJS автоматично викличе цей метод при зупинці контейнера
  onApplicationShutdown(signal?: string) {
    if (signal === 'SIGTERM') {
      this.logger.log('SIGTERM received. Starting graceful shutdown...');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
