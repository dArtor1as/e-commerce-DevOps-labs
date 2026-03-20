import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  // Додати фільм до улюблених
  @Post()
  create(@Body() createFavouriteDto: CreateFavouriteDto) {
    const { userId, movieId } = createFavouriteDto;
    return this.favouritesService.createFavourite(userId, movieId);
  }

  // Отримати всі улюблені фільми користувача
  @Get(':userId')
  findAllByUser(@Param('userId') userId: number) {
    return this.favouritesService.findAllByUser(Number(userId));
  }

  // Видалити фільм з улюблених
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.favouritesService.deleteFavourite(Number(id));
  }
}
