import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  Headers,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('ratings')
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('movie/:movieId/me')
  async getMyRating(
    @Param('movieId') movieId: number,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) return { value: null };
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const rating = await this.ratingsService.getUserRatingForMovie(
        decoded.sub,
        Number(movieId),
      );
      return { value: rating ? rating.value : null };
    } catch {
      return { value: null };
    }
  }

  @Post()
  create(
    @Req() req: { user: { sub: number; email: string } }, // Типізуємо прямо тут
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const userId = req.user.sub;
    // console.log(userId);
    return this.ratingsService.createRating(userId, createRatingDto);
  }

  @Get()
  findAll() {
    return this.ratingsService.getAllRatings();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ratingsService.getRatingById(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.updateRating(Number(id), updateRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ratingsService.deleteRating(Number(id));
  }
}
