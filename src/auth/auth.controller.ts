import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto) {
    const user = await this.authService.validateUser(email, password);
    const result = await this.authService.login(user);
    return result;
  }

  @Post('register')
  async register(
    @Body() { email, password, username }: RegisterDto,
    @Res() res,
  ) {
    await this.authService.register(email, password, username);
    res.redirect('/login');
  }
}
