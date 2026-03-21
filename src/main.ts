import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { JsonLoggerService } from './logger/json-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new JsonLoggerService(),
  });

  // Реєстрація хелпера для форматування дати перед налаштуванням view engine
  hbs.registerHelper('formatDate', function (date) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleDateString('en-US', options);
  });

  hbs.registerHelper('range', function (start, end, block) {
    let result = '';
    for (let i = start; i >= end; i--) {
      result += block.fn(i);
    }
    return result;
  });

  // Налаштовуємо директорію для шаблонів та статичних файлів
  app.setBaseViewsDir(join(process.cwd(), 'views'));

  // Вмикаємо слухачі сигналів для Graceful Shutdown
  app.enableShutdownHooks();

  // Налаштовуємо Handlebars як view engine
  app.setViewEngine('hbs');

  // Налаштовуємо директорію для статичних файлів
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Глобально застосовуємо валідаційні пайпи для всіх маршрутів
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use('/login', (req, res) => res.render('login'));
  app.use('/register', (req, res) => res.render('register'));

  await app.listen(3000);
}
bootstrap();
