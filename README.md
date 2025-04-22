# SaaS Boilerplate with Multitenancy (NestJS + TypeORM)

This boilerplate is a solid starting point for building SaaS applications with full multitenancy support, clean architecture, and modern development practices using Node.js and NestJS.

## Purpose

Scalably address the challenge of managing multiple clients (tenants) in a SaaS platform, offering flexibility for:

- Tenants sharing or having dedicated databases
- Centralized tenant and database management through an admin area
- Strong data isolation and secure tenant authentication

## Key Features

- True Multitenancy, with:
  - Isolated Admin Database (admin.sqlite, PostgreSQL, or any TypeORM-compatible DB)
  - Multiple operational databases (shared or dedicated)
  - Tenant-aware entities via tenantId column, ensuring full compatibility with any DB (no schemas used)
- Separate Admin Area, with:
  - Independent login (AdminUsers)
  - Management of tenants and available databases
- Tenant-level authentication using JWT
- Automatic tenant injection on each request with enforced isolation
- Modern and organized architecture:
  - Clean Architecture + SOLID + DRY principles
  - Dependency injection via NestJS
- Fully documented APIs with Swagger (interactive and testable)

## Project Structure

Organized by domain:

```
src/
├── admin/                # AdminUsers, Tenants, and Databases
├── auth/                 # Authentication for Admin and Tenant
├── tenant-aware/         # Operational features (Users etc.)
├── shared/               # Middlewares, decorators, base services, interceptors
├── config/               # Configuration module
└── main.ts               # Application bootstrap
```

## Tech Stack

- Node.js + NestJS
- TypeORM ORM
- PostgreSQL for production / SQLite for development
- JWT for authentication
- Swagger for interactive API documentation

## How Multitenancy Works

1. Admin registers a database (shared or dedicated).
2. A new tenant is created and linked to one of the available databases.
3. During login, the tenant's slug identifies the DB and generates a JWT.
4. All subsequent requests automatically inject the correct tenantId into controllers/services.
5. Tenant-aware entities use tenantId for access filtering.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/mau-ricio/siga-nestjs.git
cd siga-nestjs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run in development mode
npm run start:dev
```

## Roadmap

- Unit and E2E tests
- Multi-admin panel with roles and permissions
- Automated tenant provisioning with schema support
- Support for additional databases beyond PostgreSQL and SQLite
- Per-tenant monitoring (metrics, auditing)

## Current Status

- [x] Functional multitenancy with shared or dedicated DBs
- [x] Admin panel with login and tenant registration
- [x] JWT authentication per tenant and admin
- [x] Swagger ready and fully functional
- [ ] Automated testing (coming soon)

## Contributing

Pull requests and suggestions are welcome! Open an issue to discuss improvements or report bugs.

## License

[MIT](LICENSE)

---

> Built with 💻 by Mauricio | Expert in Software Modernization