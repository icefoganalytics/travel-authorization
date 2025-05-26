import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("stops", (table) => {
    table.boolean("is_actual").defaultTo(false).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("stops", (table) => {
    table.dropColumn("is_actual")
  })
}
