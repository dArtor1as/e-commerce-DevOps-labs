import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Створення рецензії
  async createReview(userId: number, createReviewDto: CreateReviewDto) {
    const { movieId, content } = createReviewDto;

    return this.databaseService.review.create({
      data: {
        content,
        user: { connect: { id: userId } },
        movie: { connect: { id: movieId } },
      },
    });
  }

  // Отримання всіх рецензій
  async findAll() {
    return this.databaseService.review.findMany({
      include: {
        user: true,
        movie: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Отримання однієї рецензії за ID
  async findOne(id: number) {
    const review = await this.databaseService.review.findUnique({
      where: { id },
      include: {
        user: true,
        movie: true,
        comments: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  // Оновлення рецензії
  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const { content } = updateReviewDto;

    // Перевірка, чи існує рецензія
    const review = await this.databaseService.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.databaseService.review.update({
      where: { id },
      data: { content },
    });
  }

  // Видалення рецензії
  async remove(id: number) {
    // Перевірка, чи існує рецензія
    const review = await this.databaseService.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.databaseService.review.delete({
      where: { id },
    });
  }
}
