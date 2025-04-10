import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full',
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./pages/movies/movies-list/movies-list.component').then(
        (m) => m.MoviesListComponent
      ),
  },
  {
    path: 'movie-details/:id',
    loadComponent: () =>
      import('./pages/movies/movies-details/movies-details.component').then(
        (m) => m.MoviesDetailsComponent
      ),
  },
  {
    path: 'character/:id',
    loadComponent: () =>
      import('./pages/character/character.component').then(
        (m) => m.CharacterComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'movies',
  },
];
