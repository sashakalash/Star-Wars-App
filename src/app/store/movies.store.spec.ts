import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { patchState } from '@ngrx/signals';
import { of } from 'rxjs';

import { MoviesStore } from './movies.store';
import { MovieApiService } from '../services/movie-api.service';
import { IMovie } from '../interfaces/movie.interface';
import { ICharacter } from '../interfaces/character.interface';

const mockMovies: IMovie[] = [
  {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl:
      'It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire\'s\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire\'s\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: ['https://swapi.dev/api/people/1/'],
    planets: [],
    starships: [],
    vehicles: [],
    species: [],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: 'https://swapi.dev/api/films/1/',
  },
];

const mockMovie: IMovie = mockMovies[0];

const mockCharacter: ICharacter = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.dev/api/planets/1/',
  films: ['https://swapi.dev/api/films/1/'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.dev/api/people/1/',
};

describe('MoviesStore', () => {
  let store: typeof MoviesStore.prototype;
  let httpMock: HttpTestingController;
  let movieApiService: jasmine.SpyObj<MovieApiService>;

  beforeEach(() => {
    const movieApiSpy = jasmine.createSpyObj('MovieApiService', [
      'getMovies',
      'getMovieById',
      'getCharacterById',
    ]);
    movieApiSpy.getMovies.and.returnValue(of(mockMovies));
    movieApiSpy.getMovieById.and.returnValue(of(mockMovie));
    movieApiSpy.getCharacterById.and.returnValue(of(mockCharacter));

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        { provide: MovieApiService, useValue: movieApiSpy },
        provideHttpClientTesting(),
        provideHttpClient(),
      ],
    });

    store = TestBed.inject(MoviesStore);
    httpMock = TestBed.inject(HttpTestingController);
    movieApiService = TestBed.inject(
      MovieApiService
    ) as jasmine.SpyObj<MovieApiService>;

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with correct initial state', () => {
    expect(store.movies()).toEqual([]);
    expect(store.movieMap()).toEqual(new Map());
    expect(store.movieId()).toBe('');
    expect(store.movCharMap()).toEqual(new Map());
    expect(store.charMap()).toEqual(new Map());
    expect(store.charId()).toBe('');
    expect(store.charMovMap()).toEqual(new Map());
    expect(store.isLoading()).toBeFalse();
    expect(store.isInterLoading()).toBeFalse();
  });

  it('should compute movie based on movieId', () => {
    store.setMovieId('https://swapi.dev/api/films/1/');
    patchState(store, {
      movieMap: new Map([['https://swapi.dev/api/films/1/', mockMovie]]),
    });
    expect(store.movie()).toEqual(mockMovie);
  });

  it('should compute characters based on movieId', () => {
    store.setMovieId('https://swapi.dev/api/films/1/');
    patchState(store, {
      movCharMap: new Map([
        ['https://swapi.dev/api/films/1/', [mockCharacter]],
      ]),
    });
    expect(store.characters()).toEqual([mockCharacter]);
  });

  it('should compute character based on charId', () => {
    store.setCharId('https://swapi.dev/api/people/1/');
    patchState(store, {
      charMap: new Map([['https://swapi.dev/api/people/1/', mockCharacter]]),
    });
    expect(store.character()).toEqual(mockCharacter);
  });

  it('should compute charMovies based on charId', () => {
    store.setCharId('https://swapi.dev/api/people/1/');
    patchState(store, {
      charMovMap: new Map([['https://swapi.dev/api/people/1/', mockMovies]]),
    });
    expect(store.charMovies()).toEqual(mockMovies);
  });

  it('should set movieId', () => {
    store.setMovieId('https://swapi.dev/api/films/1/');
    expect(store.movieId()).toBe('https://swapi.dev/api/films/1/');
  });

  it('should set charId', () => {
    store.setCharId('https://swapi.dev/api/people/1/');
    expect(store.charId()).toBe('https://swapi.dev/api/people/1/');
  });

  it('should set current character and update charMap', () => {
    store.setCharId('https://swapi.dev/api/people/1/');
    store.setCurrentCharacter(mockCharacter);
    expect(store.charMap().get('https://swapi.dev/api/people/1/')).toEqual(
      mockCharacter
    );
    expect(store.charId()).toBe('https://swapi.dev/api/people/1/');
  });

  it('should load movies list via MovieApiService', () => {
    store.loadMoviesList();
    expect(movieApiService.getMovies).toHaveBeenCalled();
    expect(store.movies()).toEqual(mockMovies);
    expect(store.isLoading()).toBeFalse();
  });

  it('should load movie by ID and characters', () => {
    store.setMovieId('https://swapi.dev/api/films/1/');
    store.loadMovieById();
    expect(movieApiService.getMovieById).toHaveBeenCalledWith(
      'https://swapi.dev/api/films/1/'
    );
    expect(store.movieMap().get('https://swapi.dev/api/films/1/')).toEqual(
      mockMovie
    );
    expect(store.isLoading()).toBeFalse();

    expect(store.isInterLoading()).toBeFalse();
    expect(store.movCharMap().get('https://swapi.dev/api/films/1/')).toEqual([
      mockCharacter,
    ]);
  });

  it('should load character by ID and movies', () => {
    store.setCharId('https://swapi.dev/api/people/1/');
    store.loadCharacterById();
    expect(movieApiService.getCharacterById).toHaveBeenCalledWith(
      'https://swapi.dev/api/people/1/'
    );
    expect(store.charMap().get('https://swapi.dev/api/people/1/')).toEqual(
      mockCharacter
    );
    expect(store.isLoading()).toBeFalse();

    expect(store.isInterLoading()).toBeFalse();
    expect(store.charMovMap().get('https://swapi.dev/api/people/1/')).toEqual([
      mockMovie,
    ]);
  });
});
