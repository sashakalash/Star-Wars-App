import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { MovieApiResponse, MovieApiService } from './movie-api.service';
import { IMovie } from '../interfaces/movie.interface';
import { ICharacter } from '../interfaces/character.interface';
import { environment } from '../environments/environment';

const mockEnvironment = {
  apiUrl: 'https://swapi.dev/api',
  api: {
    getMoviesList: 'films',
    getMovieById: 'films/${{id}}',
    getCharacterById: 'people/${{id}}',
  },
};

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
  films: [
    'https://swapi.dev/api/films/1/',
    'https://swapi.dev/api/films/2/',
    'https://swapi.dev/api/films/3/',
    'https://swapi.dev/api/films/6/',
  ],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.dev/api/people/1/',
};

describe('MovieApiService', () => {
  let service: MovieApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MovieApiService,
        { provide: environment, useValue: mockEnvironment },
        provideHttpClientTesting(),
        provideHttpClient(),
      ],
    });

    service = TestBed.inject(MovieApiService);
    httpMock = TestBed.inject(HttpTestingController);

    (service as any).apiUrl = mockEnvironment.apiUrl;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch movies list and return IMovie array', () => {
    const mockResponse: MovieApiResponse = {
      results: mockMovies,
      count: 1,
      next: null,
      previous: null,
    };
    let moviesResult: IMovie[] | undefined;

    service.getMovies().subscribe((movies) => {
      moviesResult = movies;
      const req = httpMock.expectOne('https://swapi.dev/api/films');

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(moviesResult).toEqual(mockResponse.results);
      expect(moviesResult!.length).toBe(1);
      expect(moviesResult![0].title).toBe('A New Hope');
    });
  });

  it('should return empty array if getMovies fails', () => {
    service.getMovies().subscribe((movies) => {
      const req = httpMock.expectOne(
        `${mockEnvironment.apiUrl}/${mockEnvironment.api.getMoviesList}`
      );
      expect(req.request.method).toBe('GET');
      expect(movies).toEqual([]);
    });
  });

  it('should fetch movie by URL and return IMovie', () => {
    const url = 'https://swapi.dev/api/films/1/';
    service.getMovieById(url).subscribe((movie) => {
      const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/films/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMovie);

      expect(movie).toEqual(mockMovie);
      expect(movie.title).toBe('A New Hope');
    });
  });

  it('should return undefined if getMovieById fails', () => {
    const url = 'https://swapi.dev/api/films/1/';
    service.getMovieById(url).subscribe((movie) => {
      const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/films/1`);
      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Network error'));

      expect(movie).toBeUndefined();
    });
  });

  it('should fetch character by URL and return ICharacter', () => {
    const url = 'https://swapi.dev/api/people/1/';
    service.getCharacterById(url).subscribe((character) => {
      const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/people/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);

      expect(character).toEqual(mockCharacter);
      expect(character.name).toBe('Luke Skywalker');
    });
  });

  it('should return undefined if getCharacterById fails', () => {
    const url = 'https://swapi.dev/api/people/1/';
    service.getCharacterById(url).subscribe((character) => {
      const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/people/1`);

      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Network error'));
      expect(character).toBeUndefined();
    });
  });
});
