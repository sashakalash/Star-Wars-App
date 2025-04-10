import { Component, inject, OnInit, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { IMovie } from '../../interfaces/movie.interface';
import { MoviesStore } from '../../store/movies.store';
import { urlCombiner, RouteType } from '../../utilities/url-combiner.util';
import * as idExtracterUtil from '../../utilities/id-extracter.util';

@Component({
  selector: 'cmp-character',
  imports: [MatIconModule, MatListModule, MatProgressBarModule],
  templateUrl: './character.component.html',
  styleUrl: './character.component.scss',
})
export class CharacterComponent implements OnInit {
  readonly store = inject(MoviesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  charId = computed(() => this.store.charId());
  character = computed(() => this.store.character());
  charMovies = computed(() => this.store.charMovies());
  loading = computed(() => this.store.isLoading());
  isInterLoading = computed(() => this.store.isInterLoading());

  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = urlCombiner(id, RouteType.CHARACTER);
      if (!this.charId()) {
        this.store.setCharId(url);
      }
      if (!this.character()) {
        this.store.loadCharacterById(this.store);
      }
    }
  }

  selectMovie(movie: IMovie): void {
    const id = idExtracterUtil.idExtracter(movie.url);
    this.store.setMovieId(movie.url);
    this.router.navigate(['/movie-details', id]);
  }
}
