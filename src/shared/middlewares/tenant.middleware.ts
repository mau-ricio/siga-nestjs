import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConnectionProviderService } from '../services/connection-provider.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly connectionProvider: ConnectionProviderService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] || req.query['tenant_id'];
    if (tenantId) {
      (req as any).tenantId = tenantId;
      const connection = await this.connectionProvider.getConnection(tenantId as string);
      (req as any).tenantConnection = connection;
      (req as any).tenantManager = connection.manager;
    }
    next();
  }
}
