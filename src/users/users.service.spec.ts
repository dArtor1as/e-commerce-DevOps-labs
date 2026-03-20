import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from 'src/database/database.service';

const mockDatabaseService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [{ id: 1, email: 'test@test.com' }];
      mockDatabaseService.user.findMany.mockResolvedValue(expectedUsers);

      expect(await service.findAll()).toEqual(expectedUsers);
      expect(db.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedUser = { id: 1, email: 'test@test.com' };
      mockDatabaseService.user.findUnique.mockResolvedValue(expectedUser);

      expect(await service.findOne(1)).toEqual(expectedUser);
      expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = {
        email: 'new@test.com',
        password: 'pass',
        username: 'user',
      };
      const expectedUser = { id: 1, ...createDto };
      mockDatabaseService.user.create.mockResolvedValue(expectedUser);

      expect(await service.create(createDto)).toEqual(expectedUser);
      expect(db.user.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { username: 'updated' };
      const expectedUser = { id: 1, username: 'updated' };
      mockDatabaseService.user.update.mockResolvedValue(expectedUser);

      expect(await service.update(1, updateDto)).toEqual(expectedUser);
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const expectedUser = { id: 1, email: 'deleted@test.com' };
      mockDatabaseService.user.delete.mockResolvedValue(expectedUser);

      expect(await service.remove(1)).toEqual(expectedUser);
      expect(db.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
