import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { DatabaseService } from '../database/database.service'; // Adjust the import as per your project structure

describe('RatingsService', () => {
  let service: RatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: DatabaseService, // Mocking DatabaseService
          useValue: {
            // Add any mock methods if necessary
          },
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
