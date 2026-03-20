import { Test, TestingModule } from '@nestjs/testing';
import { FavouritesService } from './favourites.service';
import { DatabaseService } from '../database/database.service'; // Adjust the import as per your project structure

describe('FavouritesService', () => {
  let service: FavouritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        {
          provide: DatabaseService, // Mocking DatabaseService
          useValue: {
            // Add any mock methods if necessary
          },
        },
      ],
    }).compile();

    service = module.get<FavouritesService>(FavouritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
