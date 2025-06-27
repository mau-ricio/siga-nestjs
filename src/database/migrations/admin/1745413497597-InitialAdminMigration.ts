import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAdminMigration1745413497597 implements MigrationInterface {
  name = 'InitialAdminMigration1745413497597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_users" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "email" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "UQ_2873882c38e8c07d98cb64f962d" UNIQUE ("username"), CONSTRAINT "UQ_dcd0c8a4b10af9c986e510b9ecc" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "databases" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "type" varchar CHECK( "type" IN ('postgres','sqlite') ) NOT NULL, "url" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, CONSTRAINT "UQ_4f56ebcf8cba238205136aa00f1" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" varchar PRIMARY KEY NOT NULL, "slug" varchar NOT NULL, "name" varchar NOT NULL, "externalId" varchar, "status" varchar CHECK( "status" IN ('active','inactive') ) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "databaseId" varchar, CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "FK_e8a699b3ebcfe580d8de3f8018f" FOREIGN KEY ("databaseId") REFERENCES "databases" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `,
    );
    await queryRunner.query(
      `INSERT INTO admin_users ( "id", "username", "password", "email") VALUES ( 'ed80a070-155d-4b42-9310-ac44f387e6e3', 'Admin User', '$2b$10$lizpTSJa2qUMQgt1gnxwLOZTPj2upkqV6GhZF/CW2gWKb9hgcj8N.', 'admin.user@nest.js');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_2310ecc5cb8be427097154b18f"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TABLE "databases"`);
    await queryRunner.query(`DROP TABLE "admin_users"`);
  }
}
