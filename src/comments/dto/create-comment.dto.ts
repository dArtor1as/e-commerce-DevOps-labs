import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  reviewId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, {
    message: 'Comment content must be at least 1 character long',
  })
  @MaxLength(350, {
    message: 'Comment content cannot be longer than 350 characters long',
  })
  content: string;
}
