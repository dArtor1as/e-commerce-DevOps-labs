import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilmsModule } from './films/films.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';
import { DatabaseModule } from './database/database.module';
import { TmdbService } from './tmdb/tmdb.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FavouritesModule } from './favourites/favourites.module';
import { TokensService } from './tokens/tokens.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt'; // Додайте імпорт JwtModule

@Module({
  imports: [
    FilmsModule,
    UsersModule,
    ReviewsModule,
    CommentsModule,
    RatingsModule,
    DatabaseModule,
    AuthModule,
    JwtModule.register({}), // Додайте цей рядок
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_SECRET) {
          throw new Error('JWT_SECRET is not set');
        }
        if (!config.JWT_EXPIRES_IN) {
          throw new Error('JWT_EXPIRES_IN is not set');
        }
        return config;
      },
    }),
    FavouritesModule,
  ],
  controllers: [AppController],
  providers: [AppService, TmdbService, TokensService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'reviews', method: RequestMethod.POST },
        { path: 'comments', method: RequestMethod.POST },
        { path: 'ratings', method: RequestMethod.POST },
      ); // Замініть 'protected-route' на маршрути, які потрібно захистити
  }
}
