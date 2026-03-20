import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30, {
    message: 'Password cannot be longer than 30 characters long',
  })
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30, {
    message: 'Username cannot be longer than 30 characters long',
  })
  username: string;
}
