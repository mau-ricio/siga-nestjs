import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferredDrinkToFriends1751047195804
  implements MigrationInterface
{
  name = 'AddPreferredDrinkToFriends1751047195804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "friends" ADD COLUMN "preferredDrink" varchar(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "friends" DROP COLUMN "preferredDrink"`,
    );
  }
}
