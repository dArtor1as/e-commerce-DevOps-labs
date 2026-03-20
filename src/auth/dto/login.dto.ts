import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30, {
    message: 'Password cannot be longer than 30 characters long',
  })
  password: string;
}
