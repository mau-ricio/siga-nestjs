import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { Friend } from './entities/friend.entity';
import { ConnectionProviderService } from '../../shared/services/connection-provider.service';

@Injectable({ scope: Scope.REQUEST })
export class FriendsService extends TenantBaseService<Friend> {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    connectionProviderService: ConnectionProviderService,
  ) {
    super(request, connectionProviderService, Friend);
  }
}
