<div align="center">

<img src="./ScreenShots/Landing-page.png" alt="Gradebook — Student Management System" width="850"/>

# 🎓 Gradebook — Student Management System

**A production-style, full-stack platform for managing student records** — secure JWT auth, live analytics, server-side search & pagination, and a fully containerized deployment.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-XE-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge)

**[Features](#-features) · [Architecture](#-architecture) · [Auth Flow](#-authentication-flow) · [Data Model](#-data-model) · [Quick Start](#-quick-start-docker) · [API Reference](#-api-reference) · [Screens](#-a-tour-of-the-app)**

</div>

<br>

> ### "One ledger for every student record you keep."
> Gradebook replaces loose spreadsheets and paper files with a single, secure portal for enrollment, marks, and admissions — built for registrars, coordinators, and academic staff.

<br>

## 🧭 Table of Contents

- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [🔐 Authentication Flow](#-authentication-flow)
- [🗃 Data Model](#-data-model)
- [🔄 Request Lifecycle](#-request-lifecycle)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start (Docker)](#-quick-start-docker)
- [💻 Manual Setup](#-manual-setup-without-docker)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [📁 Project Structure](#-project-structure)
- [🖼 A Tour of the App](#-a-tour-of-the-app)
- [🗺 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)

<br>

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🔐 Security
- JWT-based register / login / logout
- BCrypt password hashing
- Stateless, filter-based auth
- Role-based accounts (`ADMIN` / `STAFF`)
- Self-service forgot/reset password

</td>
<td width="33%" valign="top">

### 🧑‍🎓 Student Management
- Full CRUD with server-side validation
- Keyword search across records
- Sortable, paginated listings
- Marks validated (0–100 range)

</td>
<td width="33%" valign="top">

### 📊 Insights & Ops
- Live overview dashboard (single-query stats)
- Per-course distribution breakdown
- Auto-seeded sample data on boot
- Swagger/OpenAPI docs built-in
- One-command Docker deployment

</td>
</tr>
</table>

<br>

## 🏗 Architecture

Three containers, one command. The Angular SPA is compiled and served as static assets by **nginx**, which also acts as the entry point; the Spring Boot API talks to Oracle over JDBC.

```mermaid
flowchart LR
    subgraph Client["🌐 Browser"]
        UI["Angular 21 SPA<br/>(Dashboard, Auth, Students, Users)"]
    end

    subgraph Docker["🐳 Docker Compose Network"]
        subgraph FE["frontend container"]
            NGINX["nginx :80<br/>serves compiled Angular build"]
        end
        subgraph BE["backend container"]
            API["Spring Boot API :8080<br/>Controllers → Services → Repositories"]
            SEC["Spring Security<br/>JWT Filter Chain"]
            SWAGGER["Swagger UI<br/>/swagger-ui.html"]
        end
        subgraph DB["db container"]
            ORACLE[("Oracle XE 21<br/>:1521")]
        end
    end

    UI -- "HTTPS / REST (JSON)" --> NGINX
    NGINX -- "port 4200 → 80" --> UI
    UI -- "Authorization: Bearer &lt;JWT&gt;" --> API
    API --> SEC
    SEC --> API
    API -- "JDBC (ojdbc8)" --> ORACLE
    API -.-> SWAGGER

    style UI fill:#DD0031,color:#fff
    style NGINX fill:#009639,color:#fff
    style API fill:#6DB33F,color:#fff
    style SEC fill:#2b2b2b,color:#fff
    style ORACLE fill:#F80000,color:#fff
    style SWAGGER fill:#85EA2D,color:#000
```

**Layered backend design:**

```mermaid
flowchart TB
    C["Controller Layer<br/>AuthController · StudentController · UserController"]
    S["Service Layer<br/>AuthService · StudentService · UserService"]
    R["Repository Layer<br/>StudentRepository · UserRepository (Spring Data JPA)"]
    E["Entity Layer<br/>Student · User · Role"]
    D[("Oracle Database")]
    X["GlobalExceptionHandler<br/>(ResourceNotFound · DuplicateResource)"]

    C --> S --> R --> E --> D
    C -.->|"on error"| X

    style C fill:#6DB33F,color:#fff
    style S fill:#4c9c3f,color:#fff
    style R fill:#3a7a2f,color:#fff
    style E fill:#2b5c22,color:#fff
    style D fill:#F80000,color:#fff
    style X fill:#c0392b,color:#fff
```

<br>

## 🔐 Authentication Flow

Every protected request passes through a single `OncePerRequestFilter` (`JwtAuthFilter`) that validates the token and populates Spring Security's context before the request ever reaches a controller.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Angular App
    participant API as AuthController
    participant SVC as AuthService
    participant DB as Oracle DB
    participant JWT as JwtService

    U->>FE: Enter credentials
    FE->>API: POST /api/auth/login
    API->>SVC: authenticate(username, password)
    SVC->>DB: Load user by username
    DB-->>SVC: User (hashed password)
    SVC->>SVC: BCrypt.matches(password)
    SVC->>JWT: generateToken(user)
    JWT-->>SVC: signed JWT
    SVC-->>API: AuthResponse { token }
    API-->>FE: 200 OK + JWT
    FE->>FE: Store token, redirect to Dashboard

    Note over FE,API: Every subsequent request →
    FE->>API: GET /api/students (Authorization: Bearer JWT)
    API->>JWT: extractUsername + isTokenValid
    JWT-->>API: ✅ valid
    API->>API: SecurityContext ← authenticated user
    API-->>FE: 200 OK + data
```

<details>
<summary><b>🔒 What makes this secure?</b> (click to expand)</summary>

<br>

- **Stateless sessions** — `SessionCreationPolicy.STATELESS`; no server-side session state, scales horizontally
- **Password hashing** — `BCryptPasswordEncoder`, never stored or returned in plaintext
- **Public vs. protected routes** — only `/api/auth/**`, `/actuator/**`, and `/swagger-ui/**` bypass the JWT filter; everything else requires a valid token
- **Fail-safe filter** — any exception during token parsing clears the security context, letting Spring's entry point return a clean `401`
- **DTO-level redaction** — `UserResponse` excludes the password field at the object level, not just via serialization filtering

</details>

<br>

## 🗃 Data Model

```mermaid
erDiagram
    STUDENTS {
        Long id PK
        String stud_name
        String course
        Double marks
        LocalDate admission_date
    }

    PORTAL_USERS {
        Long id PK
        String full_name
        String username UK
        String email UK
        String password
        Role role
        LocalDateTime created_at
    }

    PORTAL_USERS ||--o{ STUDENTS : "manages (via API, no FK)"
```

> `students` and `portal_users` are independent tables — `portal_users` represents staff accounts that *operate* the system (via JWT-authenticated API calls), not a foreign-key relationship to student records. Indexes on `stud_name`, `course`, `marks`, and `admission_date` keep list/search/sort queries fast as the roster grows.

<br>

## 🔄 Request Lifecycle

How a single "Add Student" action flows end-to-end:

```mermaid
flowchart LR
    A["📝 Fill form<br/>(addstudent component)"] --> B["Angular validates<br/>required fields, marks range"]
    B --> C["POST /api/students<br/>+ JWT header"]
    C --> D["JwtAuthFilter<br/>validates token"]
    D --> E["StudentController<br/>@Valid @RequestBody"]
    E --> F["StudentService<br/>business rules"]
    F --> G["StudentRepository<br/>JPA save()"]
    G --> H[("Oracle DB<br/>student_seq → INSERT")]
    H --> I["201 Created<br/>+ saved Student JSON"]
    I --> J["UI updates list<br/>+ Overview stats refresh"]

    style A fill:#DD0031,color:#fff
    style C fill:#DD0031,color:#fff
    style D fill:#2b2b2b,color:#fff
    style E fill:#6DB33F,color:#fff
    style F fill:#6DB33F,color:#fff
    style G fill:#6DB33F,color:#fff
    style H fill:#F80000,color:#fff
    style J fill:#DD0031,color:#fff
```

<br>

## 🛠 Tech Stack

<table>
<tr><th>Layer</th><th>Technology</th></tr>
<tr><td><b>Frontend</b></td><td>

![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![RxJS](https://img.shields.io/badge/RxJS-B7178C?logo=reactivex&logoColor=white)

</td></tr>
<tr><td><b>Backend</b></td><td>

![Java](https://img.shields.io/badge/Java%2017-ED8B00?logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white) ![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?logo=springsecurity&logoColor=white)

</td></tr>
<tr><td><b>Auth</b></td><td>

![JWT](https://img.shields.io/badge/JJWT%200.12.6-000000?logo=jsonwebtokens&logoColor=white) ![BCrypt](https://img.shields.io/badge/BCrypt-4B4B4B)

</td></tr>
<tr><td><b>Database</b></td><td>

![Oracle](https://img.shields.io/badge/Oracle%20XE%2021-F80000?logo=oracle&logoColor=white)

</td></tr>
<tr><td><b>Docs</b></td><td>

![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

</td></tr>
<tr><td><b>DevOps</b></td><td>

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![nginx](https://img.shields.io/badge/nginx-009639?logo=nginx&logoColor=white)

</td></tr>
</table>

<br>

## 🚀 Quick Start (Docker)

The fastest path to a fully running stack — database, API, and UI — with **one command**.

```bash
git clone https://github.com/Manaswi-Nimje/StudentManagementSystem.git
cd StudentManagementSystem

cp .env.example .env
docker compose up --build
```

<div align="center">

| Service | URL |
|:---|:---|
| 🖥️ **Frontend** | http://localhost:4200 |
| 🔌 **Backend API** | http://localhost:8080 |
| 📑 **Swagger UI** | http://localhost:8080/swagger-ui.html |

</div>

> 💡 Sample data is auto-seeded on first boot — log in and explore immediately, no manual setup required.

<br>

## 💻 Manual Setup (Without Docker)

<details>
<summary><b>Click to expand step-by-step instructions</b></summary>

<br>

**Prerequisites:** [Java 17+](https://www.oracle.com/java/technologies/downloads/) & Maven · [Node.js 18+](https://nodejs.org/) & npm · [Angular CLI](https://angular.io/cli) · an Oracle Database instance

### 1. Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
API starts on `http://localhost:8080`

### 2. Frontend
```bash
cd frontend
npm install
ng serve
```
App available on `http://localhost:4200`

</details>

<br>

## 🔑 Environment Variables

Copy `.env.example` → `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `ORACLE_USERNAME` | Oracle database username | `studentapp` |
| `ORACLE_PASSWORD` | Oracle database password | `student123` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | *dev placeholder — must be changed* |

> ⚠️ **Never use the default `JWT_SECRET` in production.** Generate a strong one with:
> ```bash
> openssl rand -base64 48
> ```

<br>

## 📡 API Reference

<details>
<summary><b>🔐 Auth — <code>/api/auth</code></b></summary>
<br>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `POST` | `/api/auth/forgot-password` | Request a password reset |
| `POST` | `/api/auth/reset-password` | Reset password using a reset token |

</details>

<details>
<summary><b>🧑‍🎓 Students — <code>/api/students</code></b></summary>
<br>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/students` | Add a new student |
| `GET` | `/api/students?page=&size=&sortBy=&direction=` | List students (paginated & sorted) |
| `GET` | `/api/students/{id}` | Get a student by ID |
| `PUT` | `/api/students/{id}` | Update a student |
| `DELETE` | `/api/students/{id}` | Delete a student |
| `GET` | `/api/students/stats` | Overview stats — totals, average marks, top performers, per-course breakdown |
| `GET` | `/api/students/search?keyword=&page=&size=` | Search students by keyword |

**Student record schema:**

| Field | Type | Validation |
|---|---|---|
| `studName` | String | Required |
| `course` | String | Required |
| `marks` | Double | Required, 0–100 |
| `admissionDate` | Date | Required |

</details>

<details>
<summary><b>👥 Users — <code>/api/users</code></b></summary>
<br>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users?page=&size=&sortBy=&direction=` | Paginated directory of all accounts (passwords never exposed) |

</details>

> 📑 Full request/response schemas and try-it-out testing: **Swagger UI** at `/swagger-ui.html` once the backend is running.

<br>

## 📁 Project Structure

```
StudentManagementSystem/
├── backend/
│   ├── src/main/java/com/studentapp/studentmanagement/
│   │   ├── config/          # CORS config, startup data seeding
│   │   ├── controller/      # Auth, Student, User REST controllers
│   │   ├── dto/             # Request/response payloads
│   │   ├── entity/          # Student, User, Role
│   │   ├── exception/       # Global exception handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, JWT service, security config
│   │   └── service/         # Business logic layer
│   └── Dockerfile
│
├── frontend/
│   ├── src/app/
│   │   ├── landing/         # Public landing page
│   │   ├── login/ register/ forgot-password/
│   │   ├── auth/            # Route guards
│   │   ├── dashboard/       # Authenticated app shell
│   │   ├── overview/        # Analytics dashboard
│   │   ├── studentlist/     # Student list, search & pagination
│   │   ├── addstudent/      # Add/edit student form
│   │   ├── users/           # Account directory
│   │   └── profile/         # Profile lookup
│   └── Dockerfile
│
├── ScreenShots/
├── docker-compose.yml
├── .env.example
└── README.md
```

<br>

## 🖼 A Tour of the App

<table>
<tr>
<td width="50%">
<img src="./ScreenShots/Landing-page.png" width="100%"/>
<p align="center"><b>Landing Page</b><br/><sub>Public-facing intro and CTA</sub></p>
</td>
<td width="50%">
<img src="./ScreenShots/Login1.png" width="100%"/>
<p align="center"><b>Secure Login</b><br/><sub>JWT-authenticated sign-in</sub></p>
</td>
</tr>
<tr>
<td width="50%">
<img src="./ScreenShots/Registration.png" width="100%"/>
<p align="center"><b>Registration</b><br/><sub>New staff account creation</sub></p>
</td>
<td width="50%">
<img src="./ScreenShots/Overview.png" width="100%"/>
<p align="center"><b>Overview Dashboard</b><br/><sub>Live stats: totals, averages, course mix</sub></p>
</td>
</tr>
<tr>
<td width="50%">
<img src="./ScreenShots/Student-list.png" width="100%"/>
<p align="center"><b>Student List</b><br/><sub>Search, sort & paginate records</sub></p>
</td>
<td width="50%">
<img src="./ScreenShots/Accounts.png" width="100%"/>
<p align="center"><b>Account Directory</b><br/><sub>Role-based user management</sub></p>
</td>
</tr>
<tr>
<td width="50%">
<img src="./ScreenShots/Features.png" width="100%"/>
<p align="center"><b>Features Section</b><br/><sub>What the platform offers, at a glance</sub></p>
</td>
<td width="50%">
<img src="./ScreenShots/How-it-works.png" width="100%"/>
<p align="center"><b>How It Works</b><br/><sub>Guided onboarding on the landing page</sub></p>
</td>
</tr>
</table>

<br>

## 🗺 Roadmap

- [ ] Role-based UI permissions (Admin vs. Staff views)
- [ ] Bulk import/export of student records (CSV)
- [ ] Automated test coverage (JUnit + Angular unit tests)
- [ ] CI/CD pipeline via GitHub Actions
- [ ] Cloud deployment (Render / AWS / Azure)

<br>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
git checkout -b feature/your-feature-name
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

Then open a pull request. 🎉

<br>

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">

**Made by [Manaswi Nimje](https://github.com/Manaswi-Nimje)**

⭐ If this project helped you, consider giving it a star!

</div>
