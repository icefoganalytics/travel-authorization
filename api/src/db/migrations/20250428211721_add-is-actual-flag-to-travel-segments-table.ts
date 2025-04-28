import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_segments", (table) => {
    table.boolean("is_actual").defaultTo(false).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_segments", (table) => {
    table.dropColumn("is_actual")
  })
}
