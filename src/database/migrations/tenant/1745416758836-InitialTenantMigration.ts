import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTenantMigration1745416758836 implements MigrationInterface {
  name = 'InitialTenantMigration1745416758836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("tenantId" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "password" varchar NOT NULL, "active" boolean NOT NULL DEFAULT (1), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
