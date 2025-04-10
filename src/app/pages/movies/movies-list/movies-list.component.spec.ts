import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoviesListComponent } from './movies-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MoviesStore } from '../../../store/movies.store';
import { IMovie } from '../../../interfaces/movie.interface';
import { signal } from '@angular/core';

class MockMoviesStore {
  movies = signal<IMovie[]>([]);
  isLoading = signal(false);

  loadMoviesList = jasmine.createSpy('loadMoviesList');
  setMovieId = jasmine.createSpy('setMovieId');
}

const mockMovies: IMovie[] = [
  {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl:
      'It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire\'s\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire\'s\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: [],
    planets: [],
    starships: [],
    vehicles: [],
    species: [],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: 'https://swapi.dev/api/films/1/',
  },
  {
    title: 'The Empire Strikes Back',
    episode_id: 5,
    opening_crawl:
      'It is a dark time for the\r\nRebellion. Although the Death\r\nStar has been destroyed,\r\nImperial troops have driven the\r\nRebel forces from their hidden\r\nbase and pursued them across\r\nthe galaxy.\r\n\r\nEvading the dreaded Imperial\r\nStarfleet, a group of freedom\r\nfighters led by Luke Skywalker\r\nhas established a new secret\r\nbase on the remote ice world\r\nof Hoth.\r\n\r\nThe evil lord Darth Vader,\r\nobsessed with finding young\r\nSkywalker, has dispatched\r\nthousands of remote probes into\r\nthe far reaches of space....',
    director: 'Irvin Kershner',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1980-05-17',
    characters: [],
    planets: [],
    starships: [],
    vehicles: [],
    species: [],
    created: '2014-12-12T11:26:24.656000Z',
    edited: '2014-12-15T13:07:53.386000Z',
    url: 'https://swapi.dev/api/films/2/',
  },
];

describe('MoviesListComponent', () => {
  let component: MoviesListComponent;
  let fixture: ComponentFixture<MoviesListComponent>;
  let mockStore: MockMoviesStore;
  let router: Router;

  beforeEach(async () => {
    mockStore = new MockMoviesStore();
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [
        MoviesListComponent,
        MatProgressSpinnerModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        DatePipe,
      ],
      providers: [
        { provide: MoviesStore, useValue: mockStore },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load movies list if movies array is empty', () => {
    mockStore.movies.set([]);
    component.ngOnInit();

    expect(mockStore.loadMoviesList).toHaveBeenCalledWith(mockStore);
  });

  it('should not load movies list if movies array already exists', () => {
    mockStore.movies.set(mockMovies);
    mockStore.loadMoviesList.calls.reset();
    component.ngOnInit();

    expect(mockStore.loadMoviesList).not.toHaveBeenCalled();
  });

  it('should compute movies from store.movies()', () => {
    mockStore.movies.set(mockMovies);
    expect(component.movies()).toEqual(mockMovies);
  });

  it('should compute loading state from store.isLoading()', () => {
    mockStore.isLoading.set(true);
    expect(component.loading()).toBe(true);
  });

  it('should set movieId and navigate to movie-details on openMovieDetails', () => {
    const movie: IMovie = mockMovies[0];
    component.openMovieDetails(movie);

    expect(mockStore.setMovieId).toHaveBeenCalledWith(movie.url);
    expect(router.navigate).toHaveBeenCalledWith(['/movie-details', '1']);
  });

  it('should show loading spinner when loading is true', () => {
    mockStore.isLoading.set(true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).not.toBeNull();
  });

  it('should display movies list when movies exist and not loading', () => {
    mockStore.movies.set(mockMovies);
    mockStore.isLoading.set(false);
    fixture.detectChanges();

    const movieCards = fixture.nativeElement.querySelectorAll('mat-card');
    expect(movieCards.length).toBe(2);
    expect(movieCards[0].textContent).toContain('A New Hope');
    expect(movieCards[1].textContent).toContain('The Empire Strikes Back');
  });

  it('should call openMovieDetails when clicking a movie button', () => {
    mockStore.movies.set(mockMovies);
    mockStore.isLoading.set(false);
    fixture.detectChanges();

    spyOn(component, 'openMovieDetails');
    const title = fixture.nativeElement.querySelector('.movie-title');
    title.click();
    fixture.detectChanges();

    expect(component.openMovieDetails).toHaveBeenCalledWith(mockMovies[0]);
  });
});
