import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MoviesStore } from '../../../store/movies.store';
import { IMovie } from '../../../interfaces/movie.interface';
import { ICharacter } from '../../../interfaces/character.interface';
import { MoviesDetailsComponent } from './movies-details.component';

class MockMoviesStore {
  movieId = signal<string | null>(null);
  movie = signal<IMovie | null>(null);
  characters = signal<ICharacter[] | null>(null);
  isLoading = signal(false);
  isInterLoading = signal(false);

  setMovieId = jasmine.createSpy('setMovieId');
  loadMovieById = jasmine.createSpy('loadMovieById');
  setCurrentCharacter = jasmine.createSpy('setCurrentCharacter');
}

const mockMovie: IMovie = {
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
};
const mockCharacters: ICharacter[] = [
  {
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
  },
];

describe('MoviesDetailsComponent', () => {
  let component: MoviesDetailsComponent;
  let fixture: ComponentFixture<MoviesDetailsComponent>;
  let mockStore: MockMoviesStore;
  let router: Router;

  beforeEach(async () => {
    mockStore = new MockMoviesStore();
    const routerSpy = { navigate: jasmine.createSpy('navigate') };
    const activatedRouteSpy = {
      snapshot: {
        paramMap: { get: jasmine.createSpy('get').and.returnValue('1') },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        MoviesDetailsComponent,
        MatIconModule,
        MatListModule,
        MatProgressBarModule,
        DatePipe,
      ],
      providers: [
        { provide: MoviesStore, useValue: mockStore },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set movieId and load movie if id is provided and movieId is null', () => {
    mockStore.movieId.set(null);
    component.ngOnInit();

    expect(mockStore.setMovieId).toHaveBeenCalledWith(
      'https://swapi.dev/api/film/1/'
    );
    expect(mockStore.loadMovieById).toHaveBeenCalledWith(mockStore);
  });

  it('should not set movieId or load movie if movieId already exists', () => {
    mockStore.movieId.set('https://swapi.dev/api/films/1/');
    mockStore.movie.set(mockMovie);
    mockStore.setMovieId.calls.reset();
    mockStore.loadMovieById.calls.reset();
    component.ngOnInit();

    expect(mockStore.setMovieId).not.toHaveBeenCalled();
    expect(mockStore.loadMovieById).not.toHaveBeenCalled();
  });

  it('should load movie if store.movie() is null', () => {
    mockStore.movieId.set('https://swapi.dev/api/films/1/');
    mockStore.movie.set(null);
    component.ngOnInit();

    expect(mockStore.loadMovieById).toHaveBeenCalledWith(mockStore);
  });

  it('should compute movieId from store', () => {
    mockStore.movieId.set('https://swapi.dev/api/films/1/');
    expect(component.movieId()).toBe('https://swapi.dev/api/films/1/');
  });

  it('should compute movie from store.movie()', () => {
    mockStore.movie.set(mockMovie);
    expect(component.movie()).toEqual(mockMovie);
  });

  it('should compute movieCharacters from store.characters()', () => {
    mockStore.characters.set(mockCharacters);
    expect(component.movieCharacters()).toEqual(mockCharacters);
  });

  it('should compute loading state from store', () => {
    mockStore.isLoading.set(true);
    expect(component.loading()).toBe(true);
  });

  it('should compute isInterLoading state from store', () => {
    mockStore.isInterLoading.set(true);
    expect(component.isInterLoading()).toBe(true);
  });

  it('should set current character and navigate to character route on selectCharacter', () => {
    const character: ICharacter = mockCharacters[0];
    component.selectCharacter(character);

    expect(mockStore.setCurrentCharacter).toHaveBeenCalledWith(character);
    expect(router.navigate).toHaveBeenCalledWith(['/character', '1']);
  });

  it('should show loading indicator when loading is true', () => {
    mockStore.isLoading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).not.toBeNull();
  });

  it('should show movie details and characters when movie exists', () => {
    mockStore.movie.set(mockMovie);
    mockStore.characters.set(mockCharacters);
    mockStore.isLoading.set(false);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h1');
    const crawlElement = fixture.nativeElement.querySelector('.opening-crawl');
    const characterList =
      fixture.nativeElement.querySelectorAll('mat-list-item');

    expect(titleElement.textContent).toContain('A New Hope');
    expect(crawlElement.textContent).toContain('It is a period of civil war');
    expect(characterList.length).toBe(1);
    expect(characterList[0].textContent).toContain('Luke Skywalker');
  });
});
