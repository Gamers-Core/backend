import { MigrationInterface, QueryRunner } from "typeorm";

export class AnnouncementSettingMedia1786904184459 implements MigrationInterface {
    name = 'AnnouncementSettingMedia1786904184459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "setting_media" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "media_id" integer NOT NULL, "setting_id" integer NOT NULL, CONSTRAINT "UQ_39b399ac5dd717101c139af1a4b" UNIQUE ("setting_id", "order"), CONSTRAINT "PK_c630b4a975de7f9967483bc4e7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "setting_media" ADD CONSTRAINT "FK_e9f0c5e0e061249e9ad5db29676" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "setting_media" ADD CONSTRAINT "FK_be132e3e3e62f98a96b7b0c22b6" FOREIGN KEY ("setting_id") REFERENCES "setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting_media" DROP CONSTRAINT "FK_be132e3e3e62f98a96b7b0c22b6"`);
        await queryRunner.query(`ALTER TABLE "setting_media" DROP CONSTRAINT "FK_e9f0c5e0e061249e9ad5db29676"`);
        await queryRunner.query(`DROP TABLE "setting_media"`);
    }

}
