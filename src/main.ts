import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  // Set the views directory
  app.setBaseViewsDir(join(process.cwd(), 'views'));

  // Set Handlebars as the view engine
  app.setViewEngine('hbs');

  // Set the static assets directory
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Увімкнення глобальної валідації
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use('/login', (req, res) => res.render('login'));
  app.use('/register', (req, res) => res.render('register'));

  await app.listen(3000);
}
bootstrap();
