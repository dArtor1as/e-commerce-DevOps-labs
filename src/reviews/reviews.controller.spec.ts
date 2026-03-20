import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

// Мокаємо ReviewsService
const mockReviewsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createReview: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Мокаємо JwtService
const mockJwtService = {
  verify: jest.fn(),
};

// Мокаємо ConfigService
const mockConfigService = {
  get: jest.fn().mockReturnValue('fake-secret'),
};

describe('ReviewsController', () => {
  let controller: ReviewsController;
  // let reviewsService: ReviewsService;
  // let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    // reviewsService = module.get<ReviewsService>(ReviewsService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllReviews', () => {
    it('should return an object with an array of reviews', async () => {
      const result = [{ id: 1, content: 'Test' }];
      mockReviewsService.findAll.mockResolvedValue(result);

      expect(await controller.getAllReviews()).toEqual({ reviews: result });
      expect(mockReviewsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getReview', () => {
    it('should return a single review by id', async () => {
      const result = { id: 1, content: 'Test' };
      mockReviewsService.findOne.mockResolvedValue(result);

      expect(await controller.getReview(1)).toEqual(result);
      expect(mockReviewsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createReview', () => {
    it('should create a review using user ID from request', async () => {
      const createDto = { movieId: 1, content: 'Nice!' };
      const req = { user: { sub: 5, email: 'test@test.com' } };
      const result = { id: 1, ...createDto, userId: 5 };

      mockReviewsService.createReview.mockResolvedValue(result);

      expect(await controller.createReview(createDto, req)).toEqual(result);
      expect(mockReviewsService.createReview).toHaveBeenCalledWith(
        5,
        createDto,
      );
    });
  });

  describe('updateReview', () => {
    const updateDto = { content: 'Updated' };
    const validHeader = 'Bearer valid-token';

    it('should throw UnauthorizedException if no header provided', async () => {
      await expect(
        controller.updateReview(1, updateDto, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error(); // Імітуємо помилку верифікації
      });

      await expect(
        controller.updateReview(1, updateDto, 'Bearer invalid'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update review if token is valid', async () => {
      const decodedPayload = { sub: 5, email: 'test@test.com' };
      mockJwtService.verify.mockReturnValue(decodedPayload);
      mockReviewsService.update.mockResolvedValue({ id: 1, ...updateDto });

      const result = await controller.updateReview(1, updateDto, validHeader);

      expect(result).toEqual({ id: 1, content: 'Updated' });
      expect(mockReviewsService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteReview', () => {
    const validHeader = 'Bearer valid-token';

    it('should throw UnauthorizedException if no header provided', async () => {
      await expect(controller.deleteReview(1, undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should delete review if token is valid', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 5 });
      mockReviewsService.remove.mockResolvedValue({ id: 1 });

      expect(await controller.deleteReview(1, validHeader)).toEqual({ id: 1 });
      expect(mockReviewsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
