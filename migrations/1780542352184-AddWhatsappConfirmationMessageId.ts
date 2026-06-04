import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhatsappConfirmationMessageId1780542352184 implements MigrationInterface {
    name = 'AddWhatsappConfirmationMessageId1780542352184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "whatsapp_message_id" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "whatsapp_message_id"`);
    }

}
