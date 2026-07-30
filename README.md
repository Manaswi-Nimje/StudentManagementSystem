<div align="center">

# 🎓 Student Management System

**A production-style, full-stack platform for managing student records** — built with **Angular 21**, **Spring Boot 3**, secured with **JWT authentication**, backed by **Oracle Database**, and fully **Dockerized** for one-command local deployment.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-XE-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

[Live Demo](#-screenshots) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start-docker) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

**Student Management System** is a full-stack web application that lets institutions manage student records through a secure, modern web interface. It goes beyond a basic CRUD demo — with JWT-based authentication, role-based accounts, server-side pagination and search, a live analytics overview, and a fully containerized deployment pipeline.

The entire stack — **Oracle XE database, Spring Boot REST API, and Angular frontend (served via nginx)** — spins up with a single `docker compose up` command.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register / login / logout with signed, expiring tokens
- 🔑 **Forgot / Reset Password** — Full self-service password recovery flow
- 🧑‍🎓 **Student Records (CRUD)** — Add, view, update, and delete students with server-side validation
- 🔍 **Search & Pagination** — Fast keyword search and paginated, sortable student listings
- 📊 **Live Overview Dashboard** — Total students, average marks, top performers, and per-course breakdown — computed in a single optimized query
- 👥 **User Directory** — Role-based accounts (`ADMIN` / `STAFF`) with paginated user management
- 🙍 **Profile Lookup** — Dedicated profile view for account details
- 🌐 **CORS-Secured API** — Explicit, configurable cross-origin policy between frontend and backend
- 🌱 **Auto Data Seeding** — Sample data pre-loaded on startup for instant testing
- 📑 **Interactive API Docs** — Swagger / OpenAPI UI included out of the box
- 🐳 **One-Command Deployment** — Full stack (DB + API + UI) via Docker Compose

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 21, TypeScript, RxJS, Font Awesome |
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Security, Spring Data JPA |
| **Auth** | JWT (JJWT 0.12.6) |
| **Database** | Oracle Database (XE 21, via `ojdbc8`) |
| **API Docs** | springdoc-openapi (Swagger UI) |
| **DevOps** | Docker, Docker Compose, nginx (frontend serving) |
| **Build Tools** | Maven, Angular CLI |

---

## 📸 Screenshots

<div align="center">

<img src="./ScreenShots/Landing-page.png" alt="Landing Page" width="800"/>
<p><em>Landing Page</em></p>

<img src="./ScreenShots/Login1.png" alt="Login" width="800"/>
<p><em>Secure Login</em></p>

<img src="./ScreenShots/Overview.png" alt="Overview Dashboard" width="800"/>
<p><em>Analytics Overview Dashboard</em></p>

<img src="./ScreenShots/Student-list.png" alt="Student List" width="800"/>
<p><em>Student List with Search & Pagination</em></p>

<img src="./ScreenShots/Accounts.png" alt="Accounts" width="800"/>
<p><em>User / Account Directory</em></p>

</div>

---

## 🚀 Quick Start (Docker)

The fastest way to run the full stack — database, API, and UI — with one command.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose

### Run it

```bash
git clone https://github.com/Manaswi-Nimje/StudentManagementSystem.git
cd StudentManagementSystem

cp .env.example .env
docker compose up --build
```

That's it. Once the containers are healthy:

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:4200 |
| 🔌 Backend API | http://localhost:8080 |
| 📑 Swagger UI | http://localhost:8080/swagger-ui.html |

---

## 💻 Manual Setup (Without Docker)

### Prerequisites
- [Java 17+](https://www.oracle.com/java/technologies/downloads/) & Maven
- [Node.js 18+](https://nodejs.org/) & npm
- [Angular CLI](https://angular.io/cli)
- Access to an Oracle Database instance

### 1. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API starts on **`http://localhost:8080`**.

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

The app is available on **`http://localhost:4200`**.

---

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

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `POST` | `/api/auth/forgot-password` | Request a password reset |
| `POST` | `/api/auth/reset-password` | Reset password using a reset token |

### Students — `/api/students`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/students` | Add a new student |
| `GET` | `/api/students?page=&size=&sortBy=&direction=` | List students (paginated & sorted) |
| `GET` | `/api/students/{id}` | Get a student by ID |
| `PUT` | `/api/students/{id}` | Update a student |
| `DELETE` | `/api/students/{id}` | Delete a student |
| `GET` | `/api/students/stats` | Overview stats — totals, average marks, top performers, per-course breakdown |
| `GET` | `/api/students/search?keyword=&page=&size=` | Search students by keyword |

### Users — `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users?page=&size=&sortBy=&direction=` | Paginated directory of all accounts (passwords never exposed) |

> 📑 Full request/response schemas, DTOs, and try-it-out testing are available via **Swagger UI** at `/swagger-ui.html` once the backend is running.

### Student Record Fields

| Field | Type | Validation |
|---|---|---|
| `studName` | String | Required |
| `course` | String | Required |
| `marks` | Double | Required, 0–100 |
| `admissionDate` | Date | Required |

---

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

---

## 🗺 Roadmap

- [ ] Role-based UI permissions (Admin vs. Staff views)
- [ ] Bulk import/export of student records (CSV)
- [ ] Automated test coverage (JUnit + Angular unit tests)
- [ ] CI/CD pipeline via GitHub Actions
- [ ] Cloud deployment (Render / AWS / Azure)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
git checkout -b feature/your-feature-name
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

Then open a pull request. 🎉

---

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ by <a href="https://github.com/Manaswi-Nimje">Manaswi Nimje</a>

</div>
