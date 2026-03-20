import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('RatingsController', () => {
  let controller: RatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        RatingsService,
        {
          provide: DatabaseService, // Замоканий DatabaseService
          useValue: {
            query: jest.fn(), // Додайте методи, які викликаються в тестах
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
