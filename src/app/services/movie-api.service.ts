import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../environments/environment';
import { IMovie } from '../interfaces/movie.interface';
import { idExtracter } from '../utilities/id-extracter.util';
import { ICharacter } from '../interfaces/character.interface';

export interface MovieApiResponse {
  results: IMovie[];
  count: number;
  next: any;
  previous: any;
}

@Injectable({
  providedIn: 'root',
})
export class MovieApiService {
  private environment = environment;
  private apiUrl = this.environment.apiUrl;
  private readonly http = inject(HttpClient);

  getMovies(): Observable<IMovie[]> {
    return this.http
      .get<MovieApiResponse>(
        `${this.apiUrl}/${this.environment.api.getMoviesList}`
      )
      .pipe(
        map(({ results }) => results),
        catchError(() => of([])) // TODO Implement error catcher
      );
  }

  getMovieById(url: string): Observable<IMovie> {
    return this.http
      .get<IMovie>(
        `${this.apiUrl}/${this.environment.api.getMovieById.replace(
          '${{id}}',
          idExtracter(url)
        )}`
      )
      .pipe(
        catchError(() => of()) // TODO Implement error catcher
      );
  }

  getCharacterById(url: string): Observable<ICharacter> {
    return this.http
      .get<ICharacter>(
        `${this.apiUrl}/${this.environment.api.getCharacterById.replace(
          '${{id}}',
          idExtracter(url)
        )}`
      )
      .pipe(
        catchError(() => of()) // TODO Implement error catcher
      );
  }
}
