import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class TenantJwtStrategy extends PassportStrategy(Strategy, 'tenant-jwt') {
  private readonly logger = new Logger(TenantJwtStrategy.name);

  constructor() {
    const secret = process.env.TENANT_JWT_SECRET;
    if (!secret) {
      throw new Error('TENANT_JWT_SECRET is not defined in the environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
    if (!payload || !payload.tenantId) {
      this.logger.warn('Tenant xx ID not found in JWT payload!');
      // Depending on requirements, you might throw an UnauthorizedException here
    }
    return { userId: payload.sub, username: payload.username, tenantId: payload.tenantId };
  }
}
