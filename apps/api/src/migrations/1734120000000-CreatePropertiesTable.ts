import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreatePropertiesTable1734120000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for propertyType
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "property_type_enum" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'LAND');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'properties',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'state',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'zipCode',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'propertyType',
            type: 'property_type_enum',
          },
          {
            name: 'bedrooms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'bathrooms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'squareFeet',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'lotSize',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'yearBuilt',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'purchasePrice',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currentValue',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('properties');
    await queryRunner.query(`DROP TYPE IF EXISTS "property_type_enum"`);
  }
}

