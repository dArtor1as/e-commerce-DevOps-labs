import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  movieId: number; // ID фільму, до якого додається рецензія

  @IsString()
  @IsNotEmpty()
  content: string; // Вміст рецензії
}
