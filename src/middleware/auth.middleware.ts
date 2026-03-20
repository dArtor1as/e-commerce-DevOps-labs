import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(
    req: {
      headers: { authorization?: string };
      user?: { sub: number; email: string };
    },
    res: Response,
    next: () => void,
  ): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token format');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify<{ sub: number; email: string }>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      req.user = decoded; // Зберігаємо інформацію про користувача
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
