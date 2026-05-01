# MasterCatalogTranslation

**MasterCatalogTranslation** is a **Spring Boot + React web application** used to **manually validate and correct automatic translations of the Master Value Catalogs**.

The platform enables domain experts to review machine-generated translations, correct errors, and ensure high-quality multilingual catalog data.

---

# Overview

Automated translation tools can generate initial translations of catalog values but often require **manual verification**.

**MasterCatalogTranslation** provides a platform where translators and domain experts can:

- Review machine-generated translations
- Correct inaccurate translations
- Validate approved translations
- Import/export catalog data via Excel
- Maintain multilingual consistency across EU datasets

---

# Architecture

The application follows a modern full-stack architecture.



### Components

**Frontend**

- React 19 + TypeScript
- Vite build system
- TailwindCSS UI
- TanStack Query for data fetching
- TanStack Table for data grids
- Keycloak authentication
- shadcn/ui + Radix UI components

**Backend**

- Spring Boot REST API
- OAuth2 authentication
- JPA/Hibernate persistence
- Excel import/export support

**Database**

- PostgreSQL

---

# Tech Stack

## Backend

- Java 17
- Spring Boot 4
- Spring Web
- Spring Security
- OAuth2 Client
- OAuth2 Resource Server
- Spring Data JPA
- Hibernate
- PostgreSQL
- Lombok
- Apache POI (Excel processing)
- Maven

---

## Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- shadcn/ui
- Radix UI
- TanStack Query
- TanStack Table
- Axios
- React Router
- Recharts
- React Dropzone
- Keycloak JS

---

# Security

Authentication is handled using **OAuth2 with JWT tokens**.

The backend acts as a **Resource Server** and validates tokens issued by the configured OAuth2 provider.

Example providers:

- Keycloak
- Other OpenID Connect providers

# User Roles

The application defines several roles used for translation management.

| Role | Description |
|-----|-----|
| guest | Read-only access |
| translator | Can modify translations and approve automatic translations |
| validator | Can validate the translations made by the **translator** |
| admin | Can upload the MasterValueCatalog files and download the translated catalogs |

These roles are mapped from the OAuth2 provider.

---
# Deploy Docker

The project includes a **docker-compose-deploy.yml** file that serves as an example of how to configure the deployments

The **Frontend** and **Backend** projects each have a Dockerfile that build the respective images

The **Backend** Dockerfile requires that the maven package has been run in order to create the **/target** folder. It may also reacquire the certificate form the **Keycloak** server be updated into the **/certificate** folder

## You can export the created images form your docker repo with: 

 - docker save -o translations-backend.tar translations-backend
 - docker save -o translations-frontend.tar translations-frontend

## You can load them intro another docker instance with: 
 - docker load -i translations-frontend.tar
 - docker load -i translations-frontend.tar
