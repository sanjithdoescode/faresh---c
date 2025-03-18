import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('severity').notNullable();
    table.string('type').notNullable();
    table.string('message').notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('timestamp').notNullable();
    table.timestamps(true, true);

    table.index(['type', 'timestamp']);
    table.index(['severity', 'timestamp']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('alerts');
} 