# Copilot Instructions

This project is a NestJS SaaS boilerplate with advanced multitenancy support using TypeORM and PostgreSQL for production (SQLite for local development). It implements sophisticated multi-tenancy with dynamic database connections, providing complete data isolation through separate physical databases when needed.

## Project Overview

**Tech Stack:**
- Node.js + NestJS
- TypeORM ORM
- PostgreSQL for production / SQLite for development
- JWT for authentication (dual strategies)
- Swagger for interactive API documentation

**Architecture:**
This project implements advanced multitenancy that differs from traditional single-database approaches:
- **Central admin database** stores tenant metadata and database configurations
- **Dynamic database connections** are created at runtime for each tenant
- **Complete data isolation** through separate physical databases
- **Dual migration system** for admin and tenant entities
- **Flexible deployment** supporting shared or dedicated databases per tenant

## Project Folder Structure

```
src/
├── admin/                    # Admin-only entities and controllers (non-tenant aware)
│   ├── admin-users/          # Admin user management
│   ├── databases/            # Database connection configurations
│   └── tenants/              # Tenant management
├── auth/                     # Authentication for both Admin and Tenant
│   ├── strategies/           # JWT strategies for admin and tenant
│   ├── guards/               # Authentication guards
│   └── dto/                  # Auth-related DTOs
├── tenant-aware/             # Tenant-scoped entities and controllers
│   ├── users/                # Tenant user management
│   ├── friends/              # Example tenant feature
│   └── [other features]/     # Additional tenant-specific modules
├── shared/                   # Shared utilities and base classes
│   ├── entities/             # TenantBase and other base entities
│   ├── services/             # TenantBaseService, BaseService, ConnectionProvider
│   ├── decorators/           # @TenantEntity, @TenantColumn
│   ├── interceptors/         # Request interceptors
│   └── middlewares/          # Custom middlewares
├── config/                   # Configuration modules
├── database/                 # Database configurations and migrations
│   └── migrations/
│       ├── admin/            # Admin database migrations
│       └── tenant/           # Tenant database migrations
└── main.ts                   # Application bootstrap
```

**Folder Organization Rules:**
- **admin/**: Non-tenant aware entities, services, and controllers
- **tenant-aware/**: Tenant-scoped features that require tenant isolation
- **shared/**: Base classes, utilities, and common services used across the application
- **auth/**: Authentication logic supporting both admin and tenant workflows

## Naming Conventions

**Files and Directories:**
- Use kebab-case for file names: `user-management.service.ts`
- Use PascalCase for class names: `UserManagementService`
- Use camelCase for method and property names: `findUserById`

**Entity Naming:**
- Entity classes: `User`, `AdminUser`, `Friend`
- Entity files: `user.entity.ts`, `admin-user.entity.ts`
- Database table names: use decorator options like `@Entity({ name: 'users' })`

**Service Naming:**
- Service classes: `UsersService`, `AdminUserService`, `DatabasesService`
- Service files: `users.service.ts`, `admin-user.service.ts`

**Controller Naming:**
- Controller classes: `UsersController`, `AdminAuthController`
- Controller files: `users.controller.ts`, `admin-auth.controller.ts`

**DTO Naming:**
- DTO classes: `CreateUserDto`, `UpdateUserDto`, `LoginDto`
- DTO files: `create-user.dto.ts`, `update-user.dto.ts`

**Repository Naming:**
- Custom repositories: `UserRepository`, `TenantRepository`
- Repository files: `user.repository.ts`, `tenant.repository.ts`

## AI Prompt Examples

Use these comment patterns to generate helpful code:

```typescript
// Generate a NestJS tenant-aware service using TenantBaseService with CRUD methods
// Generate a controller with tenant-jwt auth guard and Swagger decorators
// Generate a DTO with class-validator decorators and Swagger documentation
// Generate an admin entity without tenant awareness and proper timestamps
// Generate a tenant entity extending TenantBase with @TenantEntity decorator
// Generate a migration for tenant database schema changes
// Generate admin authentication endpoints with admin-jwt strategy
// Generate middleware to extract tenant information from request headers
// Generate interceptor to inject tenant context into requests
// Generate repository with tenant-aware filtering using TenantRepository
```

**Example Prompts:**
- "Create a tenant-aware Product entity with name, price, and description fields"
- "Generate a products controller with CRUD operations using tenant-jwt authentication"
- "Create an admin dashboard controller for managing tenant databases"
- "Generate a service for tenant user management with password hashing"
- "Create DTOs for product creation with proper validation and Swagger docs"

## Code Review Checklist

Before submitting pull requests, ensure your code meets these criteria:

### Architecture & Design
- [ ] Follows clean architecture principles with proper separation of concerns
- [ ] Controllers contain only routing logic, no business logic
- [ ] Services handle business logic and data manipulation
- [ ] Repositories handle data access patterns

### Multitenancy
- [ ] Tenant-aware entities extend `TenantBase` and use `@TenantEntity()` decorator
- [ ] Tenant-aware services extend `TenantBaseService<T>` with proper constructor injection
- [ ] Admin entities are non-tenant aware and properly documented
- [ ] Tenant isolation is maintained through proper service scoping

### Authentication & Authorization
- [ ] Tenant endpoints use `@UseGuards(AuthGuard('tenant-jwt'))` with `@ApiBearerAuth('tenant-jwt')`
- [ ] Admin endpoints use `@UseGuards(AuthGuard('admin-jwt'))` with `@ApiBearerAuth('admin-jwt')`
- [ ] JWT strategies are properly configured with correct secrets

### Documentation & Validation
- [ ] All DTOs have `@ApiProperty()` decorators for Swagger documentation
- [ ] Controllers have `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()` decorators
- [ ] DTOs use `class-validator` decorators for input validation
- [ ] Swagger documentation is complete and accurate

### Naming & Conventions
- [ ] File names follow kebab-case convention
- [ ] Class names follow PascalCase convention
- [ ] All names are in English
- [ ] Comments are in English

### Testing
- [ ] Unit tests exist for new services and critical business logic
- [ ] E2E tests cover new API endpoints
- [ ] Tests follow existing patterns and conventions

### Database & Migrations
- [ ] Database schema changes have corresponding migrations
- [ ] Admin migrations target admin database
- [ ] Tenant migrations target tenant databases
- [ ] Migration files are properly named and documented

## Advanced Multitenancy Implementation

This project uses a sophisticated multitenancy approach:

### Core Concepts
- **Central Admin Database**: Stores tenant metadata and database configurations
- **Dynamic Connections**: Runtime database connections based on tenant context
- **Complete Isolation**: Physical separation of tenant data when required
- **Flexible Architecture**: Support for shared or dedicated databases per tenant

### Tenant-Aware Development
- Services must be `@Injectable({ scope: Scope.REQUEST })` for tenant context
- Use `TenantBaseService<T>` for automatic tenant filtering and isolation
- Entities extend `TenantBase` to automatically include `tenantId` field
- Use `@TenantEntity()` decorator instead of `@Entity()` for tenant entities

### Admin vs Tenant Patterns
**Admin Entities:**
```typescript
// AdminUser entity is not tenant aware
@Entity({ name: 'admin_users' })
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // ... other fields
}
```

**Tenant Entities:**
```typescript
// tenantId is automatically included by TenantBase
@TenantEntity({ name: 'users' })
export class User extends TenantBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // ... other fields
}
```

### Authentication Strategies
- **TenantJwtStrategy**: Uses `TENANT_JWT_SECRET`, protects tenant-aware endpoints
- **AdminJwtStrategy**: Uses `ADMIN_JWT_SECRET`, protects admin endpoints
- Separate authentication flows for admin and tenant users

### Database Migrations
- **Admin Migrations**: `npm run migration:generate:admin`, `npm run migration:run:admin`
- **Tenant Migrations**: `npm run migration:generate:tenant`, `npm run migration:run:tenant`
- Separate migration runners for admin and tenant databases

## Development Best Practices

### Validation & Documentation
- Use `class-validator` for DTO validation
- Use `class-transformer` for data transformation
- Complete Swagger documentation with proper decorators
- Implement proper error handling and validation

### Security
- Hash passwords using bcrypt with proper salt rounds
- Implement proper JWT token validation
- Use environment variables for sensitive configuration
- Validate all inputs using class-validator

### Performance
- Use request-scoped services for tenant context
- Implement proper connection pooling
- Use appropriate database indexes
- Consider caching for frequently accessed data

## Related Documentation

- [Main Repository](https://github.com/mau-ricio/siga-nestjs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Class Validator Documentation](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)

## Future Goals

### Completed Features
- [x] Functional multitenancy with shared or dedicated databases
- [x] Admin panel with login and tenant registration
- [x] JWT authentication per tenant and admin
- [x] Swagger documentation fully functional
- [x] Database migration system for admin and tenant entities
- [x] Dynamic database connection management
- [x] Complete data isolation through physical separation

### In Progress
- [ ] Automated testing (unit and E2E tests)
- [ ] Enhanced error handling and logging
- [ ] Performance optimization and caching

### Planned Features
- [ ] Multi-admin panel with roles and permissions
- [ ] Automated tenant provisioning with schema support
- [ ] Support for additional databases beyond PostgreSQL and SQLite
- [ ] Per-tenant monitoring (metrics, auditing)
- [ ] Redis caching implementation
- [ ] Advanced tenant analytics and reporting
- [ ] Tenant-specific customizations and branding

Make sure all generated code aligns with these comprehensive guidelines and follows the established patterns in the codebase.
