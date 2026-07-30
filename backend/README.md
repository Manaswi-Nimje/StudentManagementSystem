# Gradebook — Backend (Spring Boot)

REST API for the Gradebook student records system.

## Tech stack
- Java 17
- Spring Boot 3.3 (Web, Data JPA, Validation, Actuator)
- Oracle Database (JDBC via `ojdbc8`)
- springdoc-openapi (Swagger UI)
- Lombok
- Maven

## Architecture
```
Controller  -> handles HTTP requests, calls Service
Service     -> business logic (interface + impl, so it's mockable/testable)
Repository  -> talks to the database via Spring Data JPA
Entity      -> maps to the `students` table
GlobalExceptionHandler -> converts exceptions into clean JSON error responses
```

Pagination uses a hand-written Oracle `ROWNUM` query (see `StudentServiceImpl`) so it
works on Oracle 11g and up, not just 12c+'s `OFFSET/FETCH`.

## Configuration

Nothing is hardcoded — everything in `application.properties` reads from environment
variables with local-dev defaults, so real credentials never need to live in source control.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP port (most hosts set this automatically) |
| `ORACLE_URL` | `jdbc:oracle:thin:@localhost:1521:XE` | JDBC connection string |
| `ORACLE_USERNAME` | `studentapp` | DB user |
| `ORACLE_PASSWORD` | `student123` | DB password |
| `DDL_AUTO` | `update` | Hibernate schema mode — use `validate` in real production once the schema is stable |
| `SHOW_SQL` | `false` | Log generated SQL |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Comma-separated list of origins allowed to call the API |
| `JWT_SECRET` | *(dev default — override this)* | Signs login tokens issued by `/api/auth/login` and `/api/auth/register` |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | How long a login token stays valid |

Copy `.env.example` (repo root) to `.env` and fill in real values before using `docker compose`.

## Running locally

### Option A — you already have Oracle running
```bash
mvn spring-boot:run
```

### Option B — no Oracle install, use Docker
From the **repo root** (not this folder):
```bash
docker compose up
```
This starts an Oracle XE container, waits for it to be healthy, then starts the API on
`http://localhost:8080`.

## API docs
Once running, interactive API docs are at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Health check
`GET /actuator/health` — used by hosting platforms (Render, Railway, etc.) to know the
service is up.

## API endpoints

All `/api/students/**` endpoints require a valid JWT — send it as
`Authorization: Bearer <token>` (the token returned by login/register).

| Method | URL | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a staff account, returns a token |
| POST | `/api/auth/login` | No | Sign in, returns a token |
| POST | `/api/students` | Yes | Add a new student |
| GET | `/api/students?page=0&size=10&sortBy=id&direction=asc` | Yes | Paginated list |
| GET | `/api/students/{id}` | Yes | Get one student |
| PUT | `/api/students/{id}` | Yes | Update a student |
| DELETE | `/api/students/{id}` | Yes | Delete a student |
| GET | `/api/students/search?keyword=cse&page=0&size=10` | Yes | Search by name/course |

### Sample register/login request
```json
{
  "fullName": "Priya Sharma",
  "username": "priya_registrar",
  "email": "priya@institution.edu",
  "password": "at-least-6-chars"
}
```
Login only needs `username` and `password`. Both endpoints respond with
`{ "token": "...", "id": ..., "fullName": "...", "username": "...", "email": "...", "role": "STAFF" }`.

### Sample request body (POST/PUT `/api/students`)
```json
{
  "studName": "Aarav Sharma",
  "course": "Computer Science",
  "marks": 92.45,
  "admissionDate": "2024-01-15"
}
```
`id` is auto-generated — don't send it.

### Quick test with curl
```bash
# Register (or log in) to get a token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Staff","username":"teststaff","email":"test@example.com","password":"password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Use it to call a protected endpoint
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"studName":"Test Student","course":"CSE","marks":88,"admissionDate":"2024-01-01"}'
```

## Docker

Build and run standalone:
```bash
docker build -t gradebook-api .
docker run -p 8080:8080 \
  -e ORACLE_URL="jdbc:oracle:thin:@your-host:1521:XE" \
  -e ORACLE_USERNAME="studentapp" \
  -e ORACLE_PASSWORD="your-password" \
  -e CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com" \
  gradebook-api
```

## Deploying

See `/DEPLOYMENT.md` at the repo root for step-by-step guides (Oracle Cloud Free Tier,
Render, and a single-VM Docker Compose setup).
