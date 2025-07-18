import { Entity, Column } from 'typeorm';

export function TenantEntity(options?: any): ClassDecorator {
  return function (target: Function) {
    Entity(options)(target);
  };
}
