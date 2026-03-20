import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Мокаємо UsersService
const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  // let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    // service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, email: 'test@test.com' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const result = { id: 1, email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(result);

      // Перевіряємо, що рядок '1' конвертується в число 1
      expect(await controller.findOne('1')).toBe(result);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'pass',
        username: 'user',
      };
      const result = { id: 1, ...dto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { username: 'updated' };
      const result = { id: 1, username: 'updated' };
      mockUsersService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toBe(result);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { id: 1, email: 'deleted@test.com' };
      mockUsersService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
