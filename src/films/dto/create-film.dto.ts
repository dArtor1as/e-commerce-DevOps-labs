import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateFilmDto {
  @IsNotEmpty()
  @IsInt()
  tmdbId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  posterPath?: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  genre: string[];

  @IsNotEmpty()
  @IsInt()
  releaseYear: number;

  @IsOptional()
  @IsNumber()
  averageRating?: number;
}
