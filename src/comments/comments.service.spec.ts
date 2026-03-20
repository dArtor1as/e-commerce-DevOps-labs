import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { DatabaseService } from '../database/database.service';

const mockDatabaseService = {
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CommentsService', () => {
  let service: CommentsService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment if all fields are provided', async () => {
      const expectedComment = {
        id: 1,
        content: 'Nice!',
        userId: 2,
        reviewId: 3,
      };
      mockDatabaseService.comment.create.mockResolvedValue(expectedComment);

      const result = await service.createComment(2, 3, 'Nice!');

      expect(result).toEqual(expectedComment);
      expect(db.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Nice!',
          user: { connect: { id: 2 } },
          review: { connect: { id: 3 } },
        },
      });
    });

    it('should throw an Error if required fields are missing', async () => {
      // Перевіряємо, чи сервіс "свариться", якщо ми не передамо контент
      await expect(service.createComment(2, 3, '')).rejects.toThrow(
        'Missing required fields: userId, reviewId, or content',
      );
    });
  });

  describe('findAll', () => {
    it('should return all comments with relations', async () => {
      const expectedComments = [{ id: 1, content: 'Test' }];
      mockDatabaseService.comment.findMany.mockResolvedValue(expectedComments);

      expect(await service.findAll()).toEqual(expectedComments);
      expect(db.comment.findMany).toHaveBeenCalledWith({
        include: { user: true, review: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a comment by id with relations', async () => {
      const expectedComment = { id: 1, content: 'Test' };
      mockDatabaseService.comment.findUnique.mockResolvedValue(expectedComment);

      expect(await service.findOne(1)).toEqual(expectedComment);
      expect(db.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true, review: true },
      });
    });
  });

  describe('updateComment', () => {
    it('should update comment content', async () => {
      const expectedComment = { id: 1, content: 'Updated' };
      mockDatabaseService.comment.update.mockResolvedValue(expectedComment);

      expect(await service.updateComment(1, 'Updated')).toEqual(
        expectedComment,
      );
      expect(db.comment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated' },
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const expectedComment = { id: 1, content: 'Deleted' };
      mockDatabaseService.comment.delete.mockResolvedValue(expectedComment);

      expect(await service.deleteComment(1)).toEqual(expectedComment);
      expect(db.comment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
