import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosError } from 'axios'; // Додайте AxiosError сюди

@Injectable()
export class TmdbService {
  private readonly tmdbApiKey = process.env.TMDB_API_KEY;

  async fetchMovieFromTMDB(tmdbId: number) {
    console.log(`Fetching movie with TMDB ID: ${tmdbId}`);
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbId}`,
        {
          params: { api_key: this.tmdbApiKey },
        },
      );
      const movieData = response.data;
      return {
        tmdbId: Number(tmdbId),
        title: movieData.title,
        posterPath: movieData.poster_path,
        genre: movieData.genres.map((g) => g.name),
        releaseYear: parseInt(movieData.release_date.split('-')[0], 10),
        averageRating: movieData.vote_average,
      };
    } catch (error) {
      // БІЛЬШ БЕЗПЕЧНА ОБРОБКА ПОМИЛКИ
      let errorMessage = 'Unknown error occurred';
      if (error instanceof AxiosError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new NotFoundException(
        `Failed to fetch movie data from TMDB: ${errorMessage}`,
      );
    }
  }
}
