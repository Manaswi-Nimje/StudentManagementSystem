# Gradebook — Student Management System

A full-stack student records portal: a public landing page, secure staff
login/registration, an enrollment overview, a searchable and sortable student
ledger, add/edit forms, and a profile lookup.

**Backend:** Spring Boot 3 + Oracle Database, REST API with pagination, search,
validation, centralized error handling, Swagger docs, and JWT-based
authentication (Spring Security).
**Frontend:** Angular 21, standalone components, talking to the API — no
mock/local data.

```
StudentManagementSystem/
├── backend/    Spring Boot REST API (Java 17, Oracle)
├── frontend/   Angular 21 SPA
├── docker-compose.yml    Full local stack: Oracle XE + API + web, one command
└── DEPLOYMENT.md         How to put this online for free
```

## Features

- **Landing page** — public front page introducing the portal, with sign-in
  and registration entry points.
- **Authentication** — register a staff account and sign in via JWT-secured
  endpoints; the whole dashboard is behind a login (route guards + an HTTP
  interceptor that attaches the token and logs out on an expired session).
- **Forgot password** — a two-step username + email verification flow lets a
  staff member set a new password without an admin's help. No mail server
  required (there's no email-token link — identity is confirmed directly),
  which keeps it simple to self-host.
- **Auto-seeded on first run** — the backend loads a demo login
  (`demo_registrar` / `Demo@1234`) and a starter set of student records the
  first time it starts against an empty database, so the app is usable
  immediately instead of greeting you with an empty ledger. This is
  idempotent and never overwrites real data once any exists — see
  `backend/.../config/DataSeeder.java`.
- **Overview dashboard** — enrollment count, average marks, distinction count,
  and a course-distribution chart, computed from live data.
- **Student ledger** — loads immediately on login (no extra click), with
  search, column sorting, pagination, grade badges (A–F, derived from marks),
  and inline delete with undo-able confirmation.
- **Add / edit student** — reactive form with field-level validation.
- **Profile lookup** — search by roll number or name, or land on a student's
  profile directly via `/profile/:id`.
- Centralized backend error handling → clean, consistent JSON error responses
  instead of raw stack traces.
- Environment-based configuration on both sides — no secrets or environment-
  specific URLs hardcoded into source.

## Quick start (local, with Docker)

```bash
cp .env.example .env
docker compose up --build
```
- Frontend: http://localhost:4200
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Quick start (without Docker)

You'll need JDK 17+, Maven, Node 20+, and an Oracle database (XE works fine
for local dev). See `backend/README.md` and `frontend/README.md` for details.

```bash
# Terminal 1
cd backend
mvn spring-boot:run

# Terminal 2
cd frontend
npm install
npm start
```

## Going live

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step guides covering Oracle
Cloud's Always Free tier (keeps Oracle, $0/month), Render, and Vercel/Netlify.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Angular 21, RxJS |
| Backend | Spring Boot 3.3, Spring Data JPA, Bean Validation |
| Database | Oracle Database |
| Docs | springdoc-openapi (Swagger UI) |
| Ops | Spring Actuator health checks, Docker, Docker Compose |
