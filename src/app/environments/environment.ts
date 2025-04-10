export const environment = {
  production: false,
  appName: 'Star Wars',
  apiUrl: 'https://swapi.dev/api',
  api: {
    getMoviesList: 'films',
    getMovieById: 'films/${{id}}',
    getCharacterById: 'people/${{id}}',
  },
};
