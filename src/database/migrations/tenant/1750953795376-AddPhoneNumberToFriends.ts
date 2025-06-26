import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToFriends1750953795376
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if friends table exists first
    const hasTable = await queryRunner.hasTable('friends');

    if (hasTable) {
      // Add phoneNumber column to existing friends table
      await queryRunner.query(
        `ALTER TABLE "friends" ADD COLUMN "phoneNumber" varchar`,
      );
    } else {
      // Create the friends table with the phoneNumber column if it doesn't exist
      await queryRunner.query(
        `CREATE TABLE "friends" ("tenantId" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "phoneNumber" varchar)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if friends table exists
    const hasTable = await queryRunner.hasTable('friends');

    if (hasTable) {
      // Check if phoneNumber column exists before trying to drop it
      const hasColumn = await queryRunner.hasColumn('friends', 'phoneNumber');
      if (hasColumn) {
        await queryRunner.query(
          `ALTER TABLE "friends" DROP COLUMN "phoneNumber"`,
        );
      }
    }
  }
}
