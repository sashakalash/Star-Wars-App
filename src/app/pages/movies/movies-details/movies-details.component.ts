import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ICharacter } from '../../../interfaces/character.interface';
import { MoviesStore } from '../../../store/movies.store';
import { urlCombiner, RouteType } from '../../../utilities/url-combiner.util';
import * as idExtracterUtil from '../../../utilities/id-extracter.util';

@Component({
  selector: 'cmp-movies-details',
  imports: [MatProgressBarModule, MatIconModule, MatListModule, DatePipe],
  templateUrl: './movies-details.component.html',
  styleUrl: './movies-details.component.scss',
})
export class MoviesDetailsComponent implements OnInit {
  private readonly store = inject(MoviesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  movieId = computed(() => this.store.movieId());
  movie = computed(() => this.store.movie());
  movieCharacters = computed(() => this.store.characters());
  loading = computed(() => this.store.isLoading());
  isInterLoading = computed(() => this.store.isInterLoading());

  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = urlCombiner(id, RouteType.MOVIE);
      if (!this.movieId()) {
        this.store.setMovieId(url);
      }
      if (!this.movie()) {
        this.store.loadMovieById(this.store);
      }
    }
  }

  selectCharacter(character: ICharacter): void {
    const id = idExtracterUtil.idExtracter(character.url);
    this.store.setCurrentCharacter(character);
    this.router.navigate(['/character', id]);
  }
}
