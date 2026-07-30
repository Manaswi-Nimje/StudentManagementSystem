# Gradebook — Frontend (Angular)

Student records UI: enrollment overview, a searchable/sortable ledger, add/edit
forms, and a profile lookup — talking to the Spring Boot API in `../backend`.

## Tech stack
- Angular 21 (standalone components)
- RxJS
- Hand-rolled SVG charts (no charting library dependency)

## Configuration

The API base URL lives in `src/environments/`:
- `environment.ts` — used by `ng serve` (defaults to `http://localhost:8080/api/students`)
- `environment.prod.ts` — used by production builds. **Edit this before building for
  production** to point at your deployed backend's URL.

## Running locally
```bash
npm install
npm start
```
Open `http://localhost:4200`. The backend must be running separately (see `../backend`),
or use `docker compose up` from the repo root to start everything together.

## Building for production
```bash
npm run build
```
Output goes to `dist/StudentProject/browser`. This is a static site — it can be hosted
on Vercel, Netlify, GitHub Pages, or served from the included Dockerfile via nginx.

## Docker
```bash
docker build -t gradebook-web .
docker run -p 8080:80 gradebook-web
```

## Deploying
See `/DEPLOYMENT.md` at the repo root.
