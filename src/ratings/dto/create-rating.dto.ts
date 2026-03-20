import { IsInt, Min, Max } from 'class-validator';
export class CreateRatingDto {
  @IsInt()
  @Min(1)
  movieId: number;
  @IsInt()
  @Min(1)
  @Max(10)
  value: number; // Оцінка від 1 до 10
}
