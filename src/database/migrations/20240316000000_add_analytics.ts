import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create analytics events table
  await knex.schema.createTable('analytics_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('event_type').notNullable();
    table.uuid('user_id').nullable();
    table.string('user_type').notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('timestamp').notNullable();
    table.timestamps(true, true);

    table.index(['event_type', 'timestamp']);
    table.index(['user_id', 'timestamp']);
  });

  // Create metrics table
  await knex.schema.createTable('metrics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('metric_name').notNullable();
    table.float('value').notNullable();
    table.timestamp('timestamp').notNullable();
    table.jsonb('dimensions').nullable();
    table.timestamps(true, true);

    table.index(['metric_name', 'timestamp']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('analytics_events');
  await knex.schema.dropTable('metrics');
} 