import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table: Knex.AlterTableBuilder) => {
    table.time('check_out_time').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table: Knex.AlterTableBuilder) => {
    table.dropColumn('check_out_time');
  });
}