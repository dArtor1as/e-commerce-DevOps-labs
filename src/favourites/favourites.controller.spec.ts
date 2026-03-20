import { Test, TestingModule } from '@nestjs/testing';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import { DatabaseService } from '../database/database.service';

describe('FavouritesController', () => {
  let controller: FavouritesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouritesController],
      providers: [
        FavouritesService,
        {
          provide: DatabaseService, // Замоканий DatabaseService
          useValue: {
            query: jest.fn(), // Додайте методи, які викликаються в тестах
          },
        },
      ],
    }).compile();

    controller = module.get<FavouritesController>(FavouritesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
