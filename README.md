# SaaS Boilerplate with Advanced Multitenancy (NestJS + TypeORM)

This boilerplate is a solid starting point for building SaaS applications with full advanced multitenancy support, clean architecture, and modern development practices using Node.js and NestJS. Read the section "How Multitenancy works" bellow.

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

## How Advanced Multitenancy Works

This project implements a sophisticated multi-tenancy strategy that gives you complete flexibility in database architecture:

### Core Concept: Dynamic Database Connections

Unlike traditional single-database or schema-based multi-tenancy, this architecture:

1. **Maintains a central admin database** that stores tenant metadata and their database configurations
2. **Dynamically creates connections** to different tenant databases at runtime
3. **Completely isolates tenant data** in separate physical databases when needed

### Request Flow

1. Admin registers a database connection (can be shared or dedicated)
2. A new tenant is created and linked to one of the available databases
3. During tenant login, the system:
   - Identifies the tenant by slug/domain
   - Loads the tenant's database configuration
   - Creates/retrieves a connection to that specific database
   - Issues a JWT containing tenant information
4. For authenticated requests:
   - The JWT is validated and tenant information extracted
   - `ConnectionProviderService` provides the correct database connection for that tenant
   - All operations for that tenant only affect their assigned database
   - Complete data isolation is maintained through physical separation

### When To Use This Architecture

This multi-tenancy approach is ideal for:

- **B2B SaaS applications** with enterprise clients requiring stringent data isolation
- **Regulated industries** (healthcare, finance) where data segregation is mandatory
- **White-label solutions** where each client needs a customizable database setup
- **Hybrid deployments** mixing on-premise and cloud databases for different clients

For simpler B2C applications or smaller B2B solutions, you might consider using the simpler single-database approach with row-level filtering.

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

## Database Migration System

This project uses a dual migration system to handle both admin entities and tenant-aware entities separately:

### Important Note

TypeORM's `synchronize` option is **disabled** in both development and production environments. All database schema changes must be done through migrations to ensure data integrity and safer deployments.

### Admin Migrations

Admin migrations run on the default connection and manage admin entities:

```bash
# Generate a migration based on entity changes
npm run migration:generate:admin -- src/database/migrations/admin/MigrationName

# Create an empty migration file
npm run migration:create:admin --name=MigrationName

# Run all pending admin migrations
npm run migration:run:admin

# Revert the last applied admin migration
npm run migration:revert:admin
```

### Tenant Migrations

Tenant migrations run on each tenant database registered in your system:

```bash
# Generate a migration based on tenant entity changes
npm run migration:generate:tenant -- src/database/migrations/tenant/MigrationName

# Or create an empty tenant migration file
npm run migration:create:tenant --name=MigrationName

# Run migrations on ALL tenant databases
npm run migration:run:tenant

# Revert the last migration on ALL tenant databases
npm run migration:revert:tenant
```

The tenant migration runner connects to the admin database, fetches all registered tenant databases, and applies migrations to each one sequentially. Similarly, the revert process will connect to each tenant database and revert the last applied migration.

### Migration Best Practices

1. Always test migrations in a development environment first
2. Create separate migrations for admin and tenant changes
3. For data migrations, consider backwards compatibility
4. Add proper up/down methods to ensure reversibility
5. Add comments to complex migrations explaining the changes

# Initial credentials

This application comes with a default admin user to access the admin area. Use these credentials to log in:

User                 Password     
admin.user@nest.js   admin$2211

Note: Tenant users are not pre-created. They can be created together with tenant creation through the admin endpoints.


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
