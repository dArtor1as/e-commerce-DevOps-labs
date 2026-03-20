import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('main') // Використовуємо шаблон main.hbs
  getHello() {
    return {
      title: 'Головна сторінка',
      message: 'Ласкаво просимо на сайт про фільми!',
    }; // Дані для передачі в шаблон
  }
}
