import { Component, inject, OnInit, computed } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { IMovie } from '../../../interfaces/movie.interface';
import { MoviesStore } from '../../../store/movies.store';
import { idExtracter } from '../../../utilities/id-extracter.util';

@Component({
  selector: 'cmp-movies-list',
  imports: [
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    DatePipe,
  ],
  templateUrl: './movies-list.component.html',
  styleUrl: './movies-list.component.scss',
})
export class MoviesListComponent implements OnInit {
  private readonly store = inject(MoviesStore);
  private readonly router = inject(Router);

  movies = computed(() => this.store.movies());
  loading = computed(() => this.store.isLoading());

  ngOnInit(): void {
    if (!this.movies()?.length) {
      this.store.loadMoviesList(this.store);
    }
  }

  openMovieDetails(item: IMovie): void {
    const id = idExtracter(item.url);
    this.store.setMovieId(item.url);
    this.router.navigate(['/movie-details', id]);
  }
}
