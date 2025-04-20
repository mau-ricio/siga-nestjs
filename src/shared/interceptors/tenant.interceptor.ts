import { Injectable, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request['tenantId'];

    if (tenantId) {
      // Inject tenantId into the request context
      context.getArgs()[0]['tenantId'] = tenantId;
    }

    return next.handle();
  }
}
