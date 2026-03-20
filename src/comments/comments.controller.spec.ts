import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Мокаємо CommentsService
const mockCommentsService = {
  createComment: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
};

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest
              .fn()
              .mockReturnValue({ sub: 1, email: 'test@test.com' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment passing userId from request', async () => {
      const createDto: CreateCommentDto = { reviewId: 10, content: 'Awesome!' };
      const req = { user: { sub: 42 } }; // Імітуємо об'єкт запиту з JWT payload
      const expectedResult = { id: 1, ...createDto, userId: 42 };

      mockCommentsService.createComment.mockResolvedValue(expectedResult);

      const result = await controller.create(req, createDto);

      expect(result).toEqual(expectedResult);
      // Перевіряємо, чи сервіс викликався з правильними аргументами: userId, reviewId, content
      expect(mockCommentsService.createComment).toHaveBeenCalledWith(
        42,
        10,
        'Awesome!',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of comments', async () => {
      const expectedResult = [{ id: 1, content: 'Test comment' }];
      mockCommentsService.findAll.mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toEqual(expectedResult);
      expect(mockCommentsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single comment by id', async () => {
      const expectedResult = { id: 5, content: 'Single comment' };
      mockCommentsService.findOne.mockResolvedValue(expectedResult);

      // Контролер отримує id як рядок (з URL параметрів), тому перевіряємо конвертацію
      expect(await controller.findOne(5)).toEqual(expectedResult);
      expect(mockCommentsService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateDto: UpdateCommentDto = { content: 'Updated comment' };
      const expectedResult = { id: 5, content: 'Updated comment' };

      mockCommentsService.updateComment.mockResolvedValue(expectedResult);

      expect(await controller.update(5, updateDto)).toEqual(expectedResult);
      expect(mockCommentsService.updateComment).toHaveBeenCalledWith(
        5,
        'Updated comment',
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const expectedResult = { id: 5, content: 'Deleted comment' };
      const validHeader = 'Bearer valid-token';
      mockCommentsService.deleteComment.mockResolvedValue(expectedResult);

      expect(await controller.remove(5, validHeader)).toEqual(expectedResult);
      expect(mockCommentsService.deleteComment).toHaveBeenCalledWith(5);
    });
  });
});
