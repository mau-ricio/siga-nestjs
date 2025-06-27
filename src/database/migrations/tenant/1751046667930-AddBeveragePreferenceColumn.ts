import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBeveragePreferenceColumn1751046667930
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "friends" ADD COLUMN "beveragePreference" varchar(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "friends" DROP COLUMN "beveragePreference"`,
    );
  }
}
