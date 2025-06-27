import { Column } from 'typeorm';

export function TenantColumn(options?: any): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    Column({ ...options, type: 'varchar', nullable: false })(
      target,
      propertyKey,
    );
  };
}
