import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("flight_statistic_jobs", (table) => {
    table.boolean("failed").notNullable().defaultTo(false)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("flight_statistic_jobs", (table) => {
    table.dropColumn("failed")
  })
}
