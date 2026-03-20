import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return await this.databaseService.user.findMany();
  }

  async findOne(id: number) {
    return await this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto) {
    return await this.databaseService.user.create({
      data: createUserDto,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.user.delete({
      where: { id },
    });
  }
}
