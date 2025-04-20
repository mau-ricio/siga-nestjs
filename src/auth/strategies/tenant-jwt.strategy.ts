import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantJwtStrategy extends PassportStrategy(Strategy, 'tenant-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('TENANT_JWT_SECRET') || 'default_tenant_jwt_secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, tenantId: payload.tenantId, ...payload };
  }
}
