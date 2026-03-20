import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Створення нового коментаря
  async createComment(userId: number, reviewId: number, content: string) {
    if (!userId || !reviewId || !content) {
      throw new Error('Missing required fields: userId, reviewId, or content');
    }
    return this.databaseService.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        review: { connect: { id: reviewId } },
      },
    });
  }

  // Отримати всі коментарі
  async findAll() {
    return this.databaseService.comment.findMany({
      include: { user: true, review: true },
    });
  }

  // Отримати один коментар за його ID
  async findOne(id: number) {
    return this.databaseService.comment.findUnique({
      where: { id },
      include: { user: true, review: true },
    });
  }

  // Оновлення коментаря
  async updateComment(id: number, content: string) {
    return this.databaseService.comment.update({
      where: { id },
      data: { content },
    });
  }

  // Видалення коментаря
  async deleteComment(id: number) {
    return this.databaseService.comment.delete({
      where: { id },
    });
  }
}
