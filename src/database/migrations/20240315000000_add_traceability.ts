import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('traceability_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').references('products.id').onDelete('CASCADE');
    table.uuid('farmer_id').references('farmers.id').onDelete('CASCADE');
    table.timestamp('timestamp').notNullable();
    table.string('stage').notNullable();
    table.jsonb('data').notNullable();
    table.timestamps(true, true);

    table.index(['product_id', 'timestamp']);
    table.index(['farmer_id', 'timestamp']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('traceability_records');
} 