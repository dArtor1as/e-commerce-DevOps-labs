import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FavouritesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Додати фільм до улюблених
  async createFavourite(userId: number, movieId: number) {
    return this.databaseService.favorite.create({
      data: {
        user: { connect: { id: userId } },
        movie: { connect: { id: movieId } },
      },
    });
  }

  // Отримати всі улюблені фільми для користувача
  async findAllByUser(userId: number) {
    return this.databaseService.favorite.findMany({
      where: { userId },
      include: { movie: true },
    });
  }

  // Видалити фільм з улюблених
  async deleteFavourite(id: number) {
    return this.databaseService.favorite.delete({
      where: { id },
    });
  }
}
