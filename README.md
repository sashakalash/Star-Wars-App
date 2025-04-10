# Star Wars Movie Explorer App

This is a single-page application that allows users to explore the Star Wars universe using [SWAPI](https://swapi.dev/). Users can browse movies, view details about each film, explore character profiles, and seamlessly navigate between related entities.

The application is designed to limit the number of API requests, what achieves this by storing fetched data in `NgRx Store`, preventing redundant requests for already retrieved information. Additionally, data is persisted in `localStorage`, allowing users to refresh the page without losing previously loaded content. However, this means that newly added or updated data on the server will not be reflected on the client until the user manually clears `localStorage`.

To ensure users can see the latest data without manual intervention, the UI should include a clear `localStorage` button or switch to `sessionStorage`, which automatically clears data when the session ends.

## Tech Stack

- **`Angular 19`** – The core framework for building a dynamic, single-page application.
- **`NgRx Signal Store`** – Manages global state efficiently while leveraging Angular’s reactive features.
- **`RxJS & RxJS interop with Angular signals`** – Provides reactive data streams and enhances reactivity with signal interoperability.
- **`Angular Material`** – Delivers a sleek, consistent UI with pre-built, accessible components.
- **`Prettier & Linter`** – Maintains code quality and enforces consistent styling.
- **`Husky (pre-commit hooks)`** – Prevents bad commits by enforcing code checks before pushing changes.
- **`Unit Tests (Jasmine & Karma)`** – Ensures the reliability of the application by covering critical features with tests.

## Getting Started

1. **Unarchive the repository**

2. **Install dependencies from the root of the project**

   ```sh
   npm install
   ```

3. **Run the application**

   ```sh
   npm start
   ```

4. **Run tests**
   ```sh
   npm test
   ```

## Features

- **Movie List**: Displays a list of Star Wars movies.
- **Movie Details**: Shows title, producer, director, release date, opening crawl, and characters.
- **Character Details**: Displays personal data and movies they appeared in.
- **Navigation**: Users can move between movie and character pages seamlessly.
- **Performance Optimized**: Avoids redundant API requests by caching loaded data.
- **Responsive Design**: Mobile-friendly UI.

## Test Coverage Summary

Below is the test coverage summary for the whole project. This data provides insights into the overall test effectiveness and areas that may require additional testing.

For a more detailed breakdown of statements, branches, functions, and lines covered by the test suite, refer to the full coverage report located in the coverage folder at the root of the application.

| Metric     | Coverage Percentage | Covered / Total |
| ---------- | ------------------- | --------------- |
| Statements | 84.57%              | 148 / 175       |
| Branches   | 73.91%              | 17 / 23         |
| Functions  | 83.75%              | 67 / 80         |
| Lines      | 82.80%              | 130 / 157       |

### Additional Details

- **Total Successful Tests**: `56` (across the project).
- **Source**: Generated from `ng test` coverage report.

**Run to execute these tests and verify coverage**

```sh
  ng test --browsers=ChromeHeadless --code-coverage
```
