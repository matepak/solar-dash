# Repository Guidelines

## Project Structure & Module Organization
The React/TypeScript app lives in `src/`, with API clients under `src/api`, reusable UI in `src/components`, state providers in `src/context`, and feature pages in `src/pages`. Custom hooks and utilities sit in `src/hooks` and `src/utils` to keep side effects and formatting logic isolated. Static assets ship from `public/assets`, while production builds land in `build/`; update those directories only through the build pipeline.

## Build, Test, and Development Commands
- `npm start`: runs the development server on `http://localhost:3000` with hot reload and Firebase dev mode toggled via auth context.  
- `npm run build`: creates an optimized bundle in `build/`; use before Docker or Nginx deployment.  
- `npm test`: launches Jest in watch mode through `react-scripts`; add `--coverage` when checking summary numbers.  
- `docker compose up`: spins up the app behind the Nginx reverse proxy defined in `docker-compose.yml` for parity with production.

## Coding Style & Naming Conventions
Follow the defaults enforced by the `react-app` ESLint profile: TypeScript, JSX, and CSS modules all use two-space indentation, single quotes, and semicolon termination. Components, hooks, and contexts use PascalCase (`AuroraImages`, `ThemeContext`), while hook files begin with `use` (e.g., `useNoaaMagData`). Keep data models in `src/types` and export them from index barrels to avoid deep relative imports.

## Testing Guidelines
Jest with Testing Library is available out of the box; co-locate new tests as `<Component>.test.tsx` next to the source or under a nearby `__tests__` folder. Mock network traffic via MSW or Axios mocks so dashboards stay deterministic. Every pull request should add or update tests for changed logic and maintain the existing coverage trend—surface any unavoidable gaps in the PR discussion.

## Commit & Pull Request Guidelines
Recent history favors compact, descriptive commit subjects in sentence case (e.g., “Refactor solar wind propagation time calculation”) with optional detail after a colon. Group related changes so each commit compiles and passes tests. PRs should include a short problem/solution summary, link to tracking issues, list runtime/test commands executed, and attach UI screenshots or clips when visuals change.

## Environment & Configuration
Copy `sample.env` to `.env.local` for Firebase credentials; never commit real keys. Docker and CI rely on the same variables, so keep placeholders consistent. If you introduce new secrets or config flags, document them in `README.md` and update `sample.env` in the same change.
