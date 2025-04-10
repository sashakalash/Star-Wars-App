import { environment } from '../environments/environment';

export enum RouteType {
  MOVIE = 'film',
  CHARACTER = 'people',
}

export function urlCombiner(id: string, entity: RouteType): string {
  return `${environment.apiUrl}/${entity}/${id}/`;
}
