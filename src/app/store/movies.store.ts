import {
  getState,
  patchState,
  signalStore,
  watchState,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject, InjectionToken, computed } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { HttpClient } from '@angular/common/http';
import { pipe, tap, switchMap, from, concatMap, toArray } from 'rxjs';

import { IMovie } from '../interfaces/movie.interface';
import { ICharacter } from '../interfaces/character.interface';
import { MovieApiService } from '../services/movie-api.service';

function isMap(value: any): value is Map<any, any> {
  return value instanceof Map;
}

const STORED_STATE_KEY = 'moviesState';
const storedState = localStorage.getItem(STORED_STATE_KEY);
type MappedData = IMovie | ICharacter | IMovie[] | ICharacter[];
type StateMap = Map<string, MappedData>;

interface MoviesState {
  movies: IMovie[];
  movieMap: Map<string, IMovie>;
  movieId: string;
  movCharMap: Map<string, ICharacter[]>;
  charMap: Map<string, ICharacter>;
  charId: string;
  charMovMap: Map<string, IMovie[]>;
  isLoading: boolean;
  isInterLoading: boolean;
}

const initialState: MoviesState = {
  movies: [],
  movieMap: new Map<string, IMovie>([]),
  movieId: '',
  movCharMap: new Map<string, ICharacter[]>([]),
  charMap: new Map<string, ICharacter>([]),
  charId: '',
  charMovMap: new Map<string, IMovie[]>([]),
  isLoading: false,
  isInterLoading: false,
};

function getInitState(): MoviesState {
  if (storedState) {
    const parsedState = JSON.parse(storedState);
    const stateToParse: Record<string, any> = { ...initialState };
    (Object.keys(parsedState) as Array<keyof typeof initialState>).forEach(
      (key) => {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
          stateToParse[key] = (key as string).includes('Map')
            ? new Map(parsedState[key])
            : parsedState[key];
        }
      }
    );
    return stateToParse as MoviesState;
  }
  return initialState;
}

const MOVIES_STATE = new InjectionToken<MoviesState>('MoviesState', {
  factory: () => getInitState(),
});

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('products-store'),
  withState(() => inject(MOVIES_STATE)),
  withComputed(
    ({ movieMap, movCharMap, charMap, charMovMap, movieId, charId }) => ({
      movie: computed(() => movieMap().get(movieId())),
      characters: computed(() => movCharMap().get(movieId())),
      character: computed(() => charMap().get(charId())),
      charMovies: computed(() => charMovMap().get(charId())),
    })
  ),
  withHooks({
    onInit: (store) => {
      watchState(store, (state) => {
        const stateToStringify: Record<string, any> = { ...initialState };
        (Object.keys(state) as Array<keyof typeof initialState>).forEach(
          (key) => {
            if (Object.prototype.hasOwnProperty.call(initialState, key)) {
              if (isMap(state[key])) {
                stateToStringify[key] = Array.from(
                  (state[key] as StateMap).entries()
                );
              } else {
                stateToStringify[key] = state[key];
              }
            }
          }
        );
        localStorage.setItem(
          STORED_STATE_KEY,
          JSON.stringify(stateToStringify)
        );
      });
    },
  }),
  withMethods(
    (
      store,
      movieApiService = inject(MovieApiService),
      http = inject(HttpClient)
    ) => ({
      setMovieId(id: string): void {
        patchState(store, () => ({ movieId: id }));
      },
      setCharId(id: string): void {
        patchState(store, () => ({ charId: id }));
      },
      setCurrentCharacter(character: ICharacter): void {
        patchState(store, (state) => {
          const currentCharacter = state.charMap.get(state.charId);
          if (!currentCharacter) {
            return {
              charMap: state.charMap.set(state.charId, character),
              charId: character.url,
            };
          }
          return { charId: character.url };
        });
        if (character.films?.length) {
          from(character.films).pipe(
            concatMap((url: string) => http.get<IMovie>(url)),
            toArray(),
            tap((characterMovies: IMovie[]) =>
              patchState(store, (state) => {
                const currentCharacterMovies = state.charMap.get(state.charId);
                if (!currentCharacterMovies) {
                  return {
                    charMovMap: state.charMovMap.set(
                      state.charId,
                      characterMovies
                    ),
                    charId: character.url,
                  };
                }
                return state;
              })
            )
          );
        }
      },
      loadMoviesList: rxMethod(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return movieApiService.getMovies().pipe(
              tapResponse({
                next: (movies: IMovie[]) =>
                  patchState(store, { movies, isLoading: false }),
                error: (err) => {
                  patchState(store, { isLoading: false });
                  console.error(err); // TODO Implement appropriate error catcher
                },
              })
            );
          })
        )
      ),
      loadMovieById: rxMethod(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return movieApiService.getMovieById(store.movieId()).pipe(
              tapResponse({
                next: (movie: IMovie) => {
                  patchState(store, () => {
                    const state = getState(store);
                    const newMap = new Map(state.movieMap).set(
                      movie.url,
                      movie
                    );
                    return {
                      movieMap: newMap,
                      movieId: movie.url,
                      isLoading: false,
                    };
                  });
                },
                error: (err) => {
                  patchState(store, { isLoading: false });
                  console.error(err); // TODO Implement appropriate error catcher
                },
              }),
              switchMap((movie: IMovie) =>
                from(movie.characters).pipe(
                  tap(() => patchState(store, { isInterLoading: true })),
                  concatMap((url: string) =>
                    movieApiService.getCharacterById(url)
                  ),
                  toArray(),
                  tapResponse({
                    next: (movieCharacters: ICharacter[]) => {
                      patchState(store, () => {
                        const state = getState(store);
                        const newMap = new Map(state.movCharMap).set(
                          movie.url,
                          movieCharacters
                        );
                        return {
                          movCharMap: newMap,
                          isInterLoading: false,
                        };
                      });
                    },
                    error: (err) => {
                      patchState(store, { isInterLoading: false });
                      console.error(err); // TODO Implement appropriate error catcher
                    },
                  })
                )
              )
            );
          })
        )
      ),
      loadCharacterById: rxMethod(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return movieApiService.getCharacterById(store.charId()).pipe(
              tapResponse({
                next: (char: ICharacter) => {
                  patchState(store, (state) => {
                    const newMap = new Map(state.charMap).set(char.url, char);
                    return {
                      charMap: newMap,
                      charId: char.url,
                      isLoading: false,
                    };
                  });
                },
                error: (err) => {
                  patchState(store, { isLoading: false });
                  console.error(err); // TODO Implement appropriate error catcher
                },
              }),
              switchMap((char: ICharacter) =>
                from(char.films).pipe(
                  tap(() => patchState(store, { isInterLoading: true })),
                  concatMap((url: string) => movieApiService.getMovieById(url)),
                  toArray(),
                  tapResponse({
                    next: (charMovies: IMovie[]) => {
                      patchState(store, () => {
                        const state = getState(store);
                        const newMap = new Map(state.charMovMap).set(
                          char.url,
                          charMovies
                        );
                        return {
                          charMovMap: newMap,
                          isInterLoading: false,
                        };
                      });
                    },
                    error: (err) => {
                      patchState(store, { isInterLoading: false });
                      console.error(err); // TODO Implement appropriate error catcher
                    },
                  })
                )
              )
            );
          })
        )
      ),
    })
  )
);
