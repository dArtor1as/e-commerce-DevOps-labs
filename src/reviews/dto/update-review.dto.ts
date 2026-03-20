import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @IsNotEmpty()
  content: string; // Новий вміст рецензії
}
