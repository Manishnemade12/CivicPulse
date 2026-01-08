# Dependencies & Setup (Non-microservice)

This repo runs as two apps:

- **Backend**: Spring Boot API
- **Frontend**: Next.js web app

## Install

Tooling:

- Java **17** (or 21) + `JAVA_HOME`
- Maven **3.9+**
- Node.js **20 LTS** + npm
- Docker (optional, for local Postgres)

Backend dependencies (Maven):

- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `postgresql` driver
- `spring-boot-starter-actuator`

Frontend dependencies (npm):

- `next`, `react`, `react-dom`
- `typescript`, `@types/react`, `@types/node`
- `eslint`, `eslint-config-next`

## Run (local)

### 1) Start Postgres (optional)

From repo root:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Note: this maps Postgres to host port **5433** to avoid conflicts with any local Postgres already using 5432.

### 2) Run backend

```bash
cd backend/api
DB_PORT=5433 ./mvnw spring-boot:run
```

Backend URL:

- http://localhost:8081/
- http://localhost:8081/actuator/health

### 3) Run frontend

```bash
cd frontend/web
npm install
npm run dev -- -p 3001
```

Frontend URL:

- http://localhost:3001/
