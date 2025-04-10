import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterComponent } from './character.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviesStore } from '../../store/movies.store';
import { IMovie } from '../../interfaces/movie.interface';
import { ICharacter } from '../../interfaces/character.interface';
import { signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

class MockMoviesStore {
  charId = signal<string | null>(null);
  isLoading = signal(false);
  isInterLoading = signal(false);
  character = signal<ICharacter | null>(null);
  charMovies = signal<IMovie[] | null>(null);

  setCharId = jasmine.createSpy('setCharId');
  loadCharacterById = jasmine.createSpy('loadCharacterById');
  setMovieId = jasmine.createSpy('setMovieId');
}

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

describe('CharacterComponent', () => {
  let component: CharacterComponent;
  let fixture: ComponentFixture<CharacterComponent>;
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
        CharacterComponent,
        MatIconModule,
        MatListModule,
        MatProgressBarModule,
      ],
      providers: [
        { provide: MoviesStore, useValue: mockStore },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set charId and load character if id is provided and charId is null', () => {
    mockStore.charId.set(null);

    component.ngOnInit();

    expect(mockStore.setCharId).toHaveBeenCalledWith(
      'https://swapi.dev/api/people/1/'
    );
    expect(mockStore.loadCharacterById).toHaveBeenCalledWith(mockStore);
  });

  it('should not set charId or load character if charId already exists', () => {
    mockStore.charId.set('https://swapi.dev/api/people/1/');
    mockStore.character.set(null);
    mockStore.setCharId.calls.reset();
    mockStore.loadCharacterById.calls.reset();

    component.ngOnInit();

    expect(mockStore.setCharId).not.toHaveBeenCalled();
    expect(mockStore.loadCharacterById).toHaveBeenCalledWith(mockStore);
  });

  it('should load character if store.character() is null', () => {
    mockStore.charId.set('https://swapi.dev/api/people/1/');
    mockStore.character.set(null);

    component.ngOnInit();

    expect(mockStore.loadCharacterById).toHaveBeenCalledWith(mockStore);
  });

  it('should compute charId from store', () => {
    mockStore.charId.set('https://swapi.dev/api/people/1/');
    expect(component.charId()).toBe('https://swapi.dev/api/people/1/');
  });

  it('should compute character from store.character()', () => {
    mockStore.character.set(mockCharacter);
    expect(component.character()).toEqual(mockCharacter);
  });

  it('should compute charMovies from store.charMovies()', () => {
    mockStore.charMovies.set(mockMovies);
    expect(component.charMovies()).toEqual(mockMovies);
  });

  it('should compute loading state from store', () => {
    mockStore.isLoading.set(true);
    expect(component.loading()).toBe(true);
  });

  it('should compute isInterLoading state from store', () => {
    mockStore.isInterLoading.set(true);
    expect(component.isInterLoading()).toBe(true);
  });

  it('should set movieId and navigate to movie-details on selectMovie', () => {
    const movie: IMovie = mockMovies[0];
    component.selectMovie(movie);

    expect(mockStore.setMovieId).toHaveBeenCalledWith(movie.url);
    expect(router.navigate).toHaveBeenCalledWith(['/movie-details', '1']);
  });

  it('should show loading indicator when loading is true', () => {
    mockStore.isLoading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).not.toBeNull();
  });

  it('should show character details when character exists', () => {
    mockStore.character.set(mockCharacter);
    mockStore.charMovies.set(mockMovies);
    mockStore.isLoading.set(false);
    fixture.detectChanges();

    const nameElement = fixture.nativeElement.querySelector('h1');
    const movieList = fixture.nativeElement.querySelector('.movies-list');
    const movieListItems = movieList.querySelectorAll('mat-list-item');

    expect(nameElement.textContent).toContain('Luke Skywalker');
    expect(movieListItems.length).toBe(1);
    expect(movieListItems[0].textContent).toContain('A New Hope');
  });
});
