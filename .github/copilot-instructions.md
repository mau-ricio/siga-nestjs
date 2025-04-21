# Copilot Instructions

This project is a NestJS application with TypeORM and PostgreSQL, implementing multitenancy using a single database. For local development, use SQLite as the database. Follow these guidelines when generating code:

1. **Multitenancy**:
   - Use middleware to extract `tenant_id` from headers or query parameters.
   - Use interceptors to inject `tenant_id` into the request context.
   - Repositories should be scoped (REQUEST) and filter data by `tenant_id`.
   - Tenant-aware artifacts (e.g., controllers, modules, and services specific to tenants) should be placed in the tenant-aware folder. Base classes or shared utilities (e.g., TenantBaseService, TenantRepository) that enforce tenant filtering should be placed in the shared folder under appropriate subdirectories (e.g., shared/services)
   - Admin artifacts (non-tenant aware) should be placed in the admin folder.

2. **Naming and Language**:
   - Keep all names (entities, variables, files, etc.) in English.
   - Write comments in English.

3. **Architecture**:
   - Respect clean architecture and SOLID principles.
   - Keep a clear separation of responsibilities between controllers, services, and repositories.

4. **Entities and Services**:
   - Entities should extend `TenantBase` and use `@TenantEntity()`, without explicitly declaring `tenantId`.
   - Include a comment at the top of the class:
     ```ts
     // tenantId is automatically included by TenantBase
     ```
   - Services should extend `TenantBaseService<T>` and inject the `Repository<T>` to automatically inherit tenant filtering and tenantId population.
   - Include timestamps and soft deletes in entities.
   - Admin entities will not be tenant aware: do not extend `TenantBase` or use the `@TenantEntity()` decorator for admin entities.
   - Ensure that all admin entities are properly documented to reflect their non-tenant aware nature.
   - All DTOs and controllers needs to have decorators for Swagger documentation.

5. **Best Practices**:
- Use validation with `class-validator`.
- Configure proper authentication and authorization:
  - Use two JWT strategies: TenantJwtStrategy (guard 'tenant-jwt') and AdminJwtStrategy (guard 'admin-jwt').
  - TenantJwtStrategy uses `TENANT_JWT_SECRET` to sign tokens and protects tenant-aware controllers with `AuthGuard('tenant-jwt')`.
  - AdminJwtStrategy uses `ADMIN_JWT_SECRET` to sign tokens and protects admin controllers with `AuthGuard('admin-jwt')`.
- Document APIs with Swagger.

6. **Future Goals**:
   - Add support for migrations for database versioning.
   - Implement caching with Redis.
   - Write unit and e2e tests.

Make sure the generated code aligns with these guidelines.
