import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Метод для оновлення середнього рейтингу користувачів для фільму
  async updateUserRating(movieId: number) {
    const ratings = await this.databaseService.rating.findMany({
      where: { movieId },
      select: { value: true },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    await this.databaseService.movie.update({
      where: { id: movieId },
      data: { userRating: average },
    });

    return average;
  }
  // Створення рейтингу
  async createRating(userId, createRatingDto: CreateRatingDto) {
    const { movieId, value } = createRatingDto;

    // Шукаємо існуючий рейтинг користувача для цього фільму
    let rating = await this.databaseService.rating.findFirst({
      where: { userId, movieId },
    });

    if (rating) {
      // Якщо рейтинг існує, оновлюємо його
      rating = await this.databaseService.rating.update({
        where: { id: rating.id },
        data: { value },
      });
    } else {
      // Створення нового рейтингу
      rating = await this.databaseService.rating.create({
        data: {
          value,
          user: { connect: { id: userId } },
          movie: { connect: { id: movieId } },
        },
      });
    }

    // Оновлення середнього рейтингу користувачів для фільму
    await this.updateUserRating(movieId);

    return rating;
  }

  // Отримання рейтингу конкретного користувача для фільму
  async getUserRatingForMovie(userId: number, movieId: number) {
    return this.databaseService.rating.findFirst({
      where: { userId, movieId },
    });
  }

  // Отримання всіх рейтингів
  async getAllRatings() {
    return this.databaseService.rating.findMany();
  }

  // Отримання одного рейтингу
  async getRatingById(id: number) {
    return this.databaseService.rating.findUnique({ where: { id } });
  }

  // Оновлення рейтингу
  async updateRating(id: number, updateRatingDto: UpdateRatingDto) {
    // Отримання поточного рейтингу, щоб знайти movieId
    const currentRating = await this.databaseService.rating.findUnique({
      where: { id },
      select: { movieId: true },
    });

    if (!currentRating) {
      throw new Error('Rating not found');
    }

    // Оновлення рейтингу
    const updatedRating = await this.databaseService.rating.update({
      where: { id },
      data: { ...updateRatingDto },
    });

    // Оновлення середнього рейтингу користувачів для фільму
    await this.updateUserRating(currentRating.movieId);

    return updatedRating;
  }

  // Видалення рейтингу
  async deleteRating(id: number) {
    // Отримання поточного рейтингу, щоб знайти movieId
    const currentRating = await this.databaseService.rating.findUnique({
      where: { id },
      select: { movieId: true },
    });

    if (!currentRating) {
      throw new Error('Rating not found');
    }

    // Видалення рейтингу
    await this.databaseService.rating.delete({ where: { id } });

    // Оновлення середнього рейтингу користувачів для фільму
    await this.updateUserRating(currentRating.movieId);

    return { message: 'Rating deleted successfully' };
  }
}
