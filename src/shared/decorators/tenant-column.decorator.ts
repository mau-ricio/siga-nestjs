import { Column } from 'typeorm';

export function TenantColumn(options?: any): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Column({ ...options, type: 'varchar', nullable: false })(target, propertyKey);
  };
}
