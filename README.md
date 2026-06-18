# Ingoboka Platform

**Ingoboka** is a B2B2C digital microinsurance platform for Rwanda — a policy wallet, enrollment, billing, and claims platform connecting citizens, field agents, insurers, and platform administrators.

## Project Overview

Ingoboka enables citizens to discover, enroll in, and manage microinsurance products; insurers to configure products and process claims; agents to assist enrollment in the field; and administrators to oversee platform operations. The platform is built as a **modular monolith** with strict domain boundaries and production-grade security (JWT, RBAC, audit logging, OTP verification).

## Repository Structure

```
.
├── backend/                 # Spring Boot 3.3 modular monolith (Java 21)
│   ├── src/main/java/rw/ingoboka/
│   │   ├── identity/        # Auth, users, OTP, JWT
│   │   ├── customer/        # Citizen profiles, consent
│   │   ├── product/         # Insurance product catalog
│   │   ├── policy/          # Policies, QR verification
│   │   ├── claim/           # Claims workflow
│   │   ├── payment/         # Premium payments
│   │   ├── audit/           # Append-only audit log
│   │   └── shared/          # Cross-cutting config & utilities
│   └── src/main/resources/db/migration/  # Flyway migrations
├── frontend/                # Next.js 14 App Router (TypeScript)
│   └── src/app/             # Route groups: (auth), (citizen), (insurer), (agent)
├── docker-compose.yml       # Postgres, Redis, MinIO, Mailhog
└── .github/workflows/       # CI pipeline
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3.3, PostgreSQL 16, Flyway, Redis |
| Security | Spring Security, JWT (JJWT), BCrypt, RBAC |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Mapping | MapStruct, Lombok |
| Storage | AWS SDK S3 (MinIO locally) |
| Testing | JUnit 5, Mockito, Testcontainers |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, PWA |
| State / Data | React Query, Zustand, Axios |
| Forms | React Hook Form, Zod |
| i18n | next-intl (Kinyarwanda + English) |
| Infra | Docker Compose, GitHub Actions CI |

## Portal Routes

| Portal | Base Path | Description |
|--------|-----------|-------------|
| Citizen | `/` | Policy wallet, claims, profile |
| Insurer | `/insurer` | Products, claims queue, reports |
| Agent | `/agent` | Field enrollment assistance |
| Admin | `/admin` | Platform administration |
| QR Verify | `/verify/:token` | Public policy verification (no PII) |

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+** (or use included `./mvnw`)
- **Node.js 20+** and npm
- **Docker** and Docker Compose
- **Git**

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mahingaRodin/Ingoboka-platform.git
cd Ingoboka-platform
git checkout feat/arnold/init-platform-structure
```

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit values as needed. Never commit `.env` files.

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000

### Demo credentials (dev profile)

| User | Phone | Password | Role |
|------|-------|----------|------|
| Aline | 0780000001 | Ingoboka@2026 | CITIZEN |
| Eric | eric@demo-insurer.rw | Ingoboka@2026 | INSURER_CLAIMS_OFFICER |
| Diane | diane@demo-insurer.rw | Ingoboka@2026 | INSURER_ADMIN |
| Admin | admin@ingoboka.rw | Ingoboka@2026 | PLATFORM_ADMIN |

## Branch Naming Convention

| Prefix | Use |
|--------|-----|
| `feat/<name>/<desc>` | New features |
| `fix/<name>/<desc>` | Bug fixes |
| `chore/<name>/<desc>` | Tooling, deps, config |

Example: `feat/arnold/policy-card-qr`

## Pull Request Guidelines

1. Branch from `main` using the naming convention above.
2. Keep PRs focused — one feature or fix per PR.
3. Ensure CI passes (backend tests + frontend lint/build).
4. Include a clear description, test plan, and screenshots for UI changes.
5. Never commit secrets — use `.env.example` for documentation only.
6. Do not modify applied Flyway migrations; add new versioned migrations instead.

## Team

| Name | Role |
|------|------|
| Mahinga Rodin | Co-founder, Lead Engineer |
| Ruyange Arnold | Co-founder, Full-Stack Engineer |

## Hackathon MVP Journey

1. **Foundation** — Modular monolith, Flyway schema, JWT auth, Docker Compose
2. **Citizen flow** — Register → OTP → Consent → Browse products → Pay → Policy card + QR
3. **Insurer flow** — Product catalog → Claims queue → Decision workflow
4. **Agent flow** — Assisted enrollment in the field
5. **Platform** — Audit trail, reporting views, partner revenue ledger

## Environment Variables

All secrets and connection strings are loaded from environment variables. See `backend/.env.example` and `frontend/.env.example` for the full list. In production, use a secrets manager — never hardcode credentials in source code.
