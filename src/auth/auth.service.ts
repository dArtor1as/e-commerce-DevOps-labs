import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { TokensService } from 'src/tokens/tokens.service';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly tokenService: TokensService,
  ) {}

  // Перевірка облікових даних
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string; username: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id, email: user.email, username: user.username };
  }

  // Логін
  async login(user: { id: number; email: string; username: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `${this.configService.get<number>('JWT_EXPIRES_IN')}s`, // Час дії токена
    });

    const decodedToken = this.jwtService.verify(accessToken, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const expiresAt = new Date(decodedToken.exp * 1000);

    // Зберігаємо токен у базу даних
    await this.tokenService.createToken(user.id, accessToken, expiresAt);

    return {
      access_token: accessToken,
      expires_at: expiresAt.toISOString(),
    };
  }

  // Реєстрація
  async register(email: string, password: string, username: string) {
    const existingEmail = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    const existingUsername = await this.databaseService.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new BadRequestException('User with this username already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await this.databaseService.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    return { message: 'User successfully registered', user: newUser };
  }

  // Вихід (відкликання токена)
  async logout(token: string) {
    await this.tokenService.revokeToken(token);
    return { message: 'Successfully logged out' };
  }

  // Перевірка токена
  async validateToken(token: string) {
    const isValid = await this.tokenService.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Token is invalid or expired');
    }
    return true;
  }
}
