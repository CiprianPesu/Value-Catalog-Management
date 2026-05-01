# Value Catalog Management

**Value Catalog Management** is a **Spring Boot + React web application** used to **manually validate and correct automatic translations of the Master Value Catalogs**.

The platform enables domain experts to review machine-generated translations, correct errors, and ensure high-quality multilingual catalog data.

---

## Overview

Automated translation tools can generate initial translations of catalog values but often require **manual verification**.

**Value Catalog Management** provides a platform where translators and domain experts can:

- Review machine-generated translations
- Correct inaccurate translations
- Validate approved translations
- Import/export catalog data via Excel
- Maintain multilingual consistency across EU datasets

---

## Architecture

The application follows a modern full-stack architecture with clear separation of concerns.

### Components

**Frontend**

- React 19.2.4 + TypeScript 5.9.3
- Vite 7.3.1 build system
- TailwindCSS 4 UI framework
- TanStack Query 5.90.21 for data fetching
- TanStack Table 8.21.3 for data grids
- Keycloak 26.2.3 authentication
- Radix UI + lucide-react components
- Recharts 3.8.0 for data visualization
- React Router 7.13.1 for navigation
- Motion 12.35.0 for animations

**Backend**

- Spring Boot 4.0.1 REST API
- Spring Security with OAuth2 (Resource Server)
- Spring Data JPA with Hibernate for persistence
- Apache POI 5.5.1 for Excel processing
- PostgreSQL database driver
- SpringDoc OpenAPI 3.0.2 for API documentation
- Lombok 1.18.44 for code generation
- eHealth Audit library 1.0.0

**Database**

- PostgreSQL (Main application database)
- PostgreSQL (Separate audit database)

---

### Backend

- **Java** 21
- **Spring Boot** 4.0.1
- Spring Web
- Spring Security with OAuth2
- Spring Data JPA
- Hibernate
- PostgreSQL driver
- Lombok (code generation)
- Apache POI 5.5.1 (Excel processing)
- SpringDoc OpenAPI 3.0.2 (API documentation)
- Maven

### Frontend

- **React** 19.2.4
- **TypeScript** 5.9.3
- **Vite** 7.3.1
- **TailwindCSS** 4
- **Recharts** 3.8.0 (charting)
- TanStack Query 5.90.21 (data fetching)
- TanStack Table 8.21.3 (data grids)
- Axios 1.13.6 for HTTP requests
- React Router 7.13.1 for routing
- React Dropzone 15.0.0 for file uploads
- Keycloak JS 26.2.3 for authentication
- Motion 12.35.0 for animations
- ESLint 9.39.0 & Prettier 3.8.1 for code quality

---

## Security

Authentication is handled using **OAuth2 with JWT tokens**.

The backend acts as a **Resource Server** and validates tokens issued by the configured OAuth2 provider.

### Supported OAuth2 Providers

- **Keycloak** 26.2.3 (primary)
- Any OpenID Connect compatible provider

### User Roles

The application defines several roles used for translation management:

| Role | Description |
|-----|-----|
| guest | Read-only access to translations |
| translator | Can modify translations and approve automatic translations |
| validator | Can validate the translations made by translators |
| admin | Can upload Master Value Catalog files and download translated catalogs |

These roles are mapped from the OAuth2 provider (Keycloak).

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21 (for local backend development)
- Node.js 22+ (for local frontend development)
- PostgreSQL (if running without Docker)
- Keycloak 26.2.3 instance configured with OAuth2

### Local Development

#### Backend

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

#### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173` (Vite dev server)

### Build

#### Backend

```bash
cd Backend
mvn clean package
```

This creates a JAR file in `/target` directory.

#### Frontend

```bash
cd Frontend
npm run build
```

This creates optimized production build in `/dist` directory.

---

## Docker Deployment

### Development Setup

The project includes a **docker-compose.yml** file for local development:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

### Production Setup

Use **docker-compose-deploy.yml** for production deployments:

```bash
docker-compose -f docker-compose-deploy.yml up -d
```

This setup uses pre-built images and supports environment variable configuration.

### Building Docker Images

#### Backend Image

```bash
cd Backend
mvn clean package
docker build -t translations-backend:latest .
```

**Requirements:**
- Maven package must be run first to create `/target` folder
- SSL certificate (`fullchain.pem`) should be present for Keycloak SSL validation

#### Frontend Image

```bash
cd Frontend
docker build -t translations-frontend:latest .
```

### Exporting Docker Images

```bash
docker save -o translations-backend.tar translations-backend:latest
docker save -o translations-frontend.tar translations-frontend:latest
```

### Loading Docker Images

```bash
docker load -i translations-backend.tar
docker load -i translations-frontend.tar
```

---

## Environment Configuration

Both development and production deployments use environment variables for configuration.

### Backend Environment Variables

```env
# Spring configuration
SPRING_PROFILES_ACTIVE=prod

# Database
DB_URL=jdbc:postgresql://postgres:5432/translations
DB_USER=postgres
DB_PASSWORD=password

# Audit Database
AUDIT_DB_URL=jdbc:postgresql://postgres:5432/audit
AUDIT_DB_USER=postgres
AUDIT_DB_PASSWORD=password

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Keycloak
KEYCLOAK_ISSUER_URI=https://keycloak.example.com/realms/your-realm

# Roles (configurable)
ROLE_GUEST=guest
ROLE_ADMIN=admin
ROLE_TRANSLATOR=translator
ROLE_VALIDATOR=validator

# XML Configuration
XML_TABLE_HEADER_ROW=7
XML_CODE_SYSTEM_ID_COL=0
XML_CODE_SYSTEM_VERSION_COL=1
XML_CONCEPT_CODE_COL=2
XML_DESCRIPTION_COL=3
XML_DESCRIPTION_TRANSLATION_COL=5
XML_TRANSLATION_COLUMN_NAME=RO-RO
```

### Frontend Environment Variables

```env
BACKEND_URL=http://backend:8080
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT=translations-frontend

# Roles (configurable)
ROLE_GUEST=guest
ROLE_ADMINISTRATOR=admin
ROLE_TRANSLATOR=translator
ROLE_VALIDATOR=validator
```

---

## Project Structure

```
.
├── Backend/                          # Spring Boot backend
│   ├── pom.xml                      # Maven configuration
│   ├── Dockerfile                   # Backend Docker image
│   └── src/                         # Source code
├── Frontend/                         # React frontend
│   ├── package.json                 # Node dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── Dockerfile                   # Frontend Docker image
│   ├── entrypoint.sh                # Docker entrypoint
│   └── src/                         # Source code
├── TestFiles/                        # Test data and fixtures
├── docker-compose.yml               # Development Docker setup
├── docker-compose-deploy.yml        # Production Docker setup
└── README.md                        # This file
```

---

## API Documentation

Once the backend is running, Swagger API documentation is available at:

```
http://localhost:8080/swagger-ui.html
```

