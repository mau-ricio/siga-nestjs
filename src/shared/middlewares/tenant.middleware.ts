// filepath: /home/mauricio/dev/siga-nestjs/src/shared/middlewares/tenant.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common'; // Import Logger
import { Request, Response, NextFunction } from 'express';
import { ConnectionProviderService } from '../services/connection-provider.service';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { TenantsService } from '../../admin/tenants/tenants.service'; // Import TenantsService for slug resolution

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name); // Add logger

  constructor(
    private readonly connectionProvider: ConnectionProviderService,
    private readonly jwtService: JwtService, // Inject JwtService
    private readonly configService: ConfigService, // Inject ConfigService
    private readonly tenantsService: TenantsService, // Inject TenantsService for tenant slug resolution
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId: string | undefined = undefined;
    const authHeader = req.headers['authorization'];

    // 1. Try extracting from JWT Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      try {
        const secret = this.configService.get<string>('TENANT_JWT_SECRET');
        if (!secret) {
          this.logger.error('TENANT_JWT_SECRET not configured!');
        } else {
          const payload = await this.jwtService.verifyAsync(token, { secret });
          tenantId = payload?.tenantId;
          if (tenantId) {
            this.logger.debug(`Tenant ID found in JWT: ${tenantId}`);
          } else {
             this.logger.warn('tenantId property missing from JWT payload.');
          }
        }
      } catch (error) {
        // Ignore errors (like invalid/expired token), AuthGuard will handle rejection
        this.logger.warn(`JWT verification failed in middleware: ${error.message}`);
      }
    }

    // 2. Fallback to header or query parameters (if JWT didn't provide tenantId)
    if (!tenantId) {
      // First check for direct tenant ID in headers
      tenantId = req.headers['x-tenant-id'] as string;
      
      // If no direct tenant ID, check for tenant slug
      if (!tenantId) {
        const slug = req.query['tenant_slug'] as string;
        
        if (slug) {
          this.logger.debug(`Tenant slug found in query: ${slug}`);
          try {
            // Look up the tenant by slug using TenantsService
            const tenant = await this.tenantsService.findOneBySlug(slug);
            if (tenant) {
              tenantId = tenant.id;
              this.logger.debug(`Resolved tenant ID from slug: ${tenantId}`);
            } else {
              this.logger.warn(`Tenant with slug "${slug}" not found`);
            }
          } catch (error) {
            this.logger.error(`Error resolving tenant from slug: ${error.message}`);
          }
        }
      }
      
      tenantId = 'c9048c5c-abe8-4e73-930d-3d12a323a439'; //just to test
      
      if (tenantId) {
        this.logger.debug(`Tenant ID determined: ${tenantId}`);
      }
    }

    // 3. Attach tenantId and connection to request if found
    if (tenantId) {
      (req as any).tenantId = tenantId;
      try {
         const connection = await this.connectionProvider.getConnection(tenantId);
         (req as any).tenantConnection = connection;
         (req as any).tenantManager = connection.manager;
         this.logger.debug(`Attached connection for tenant: ${tenantId}`);
      } catch (error) {
         this.logger.error(`Failed to get connection for tenant ${tenantId}: ${error.message}`);
         // Decide how to handle connection errors - maybe block request?
         // For now, just log and continue, service might fail later.
      }
    } else {
       this.logger.warn('Tenant ID could not be determined by middleware.');
    }

    next(); // Proceed to guards, interceptors, etc.
  }
}