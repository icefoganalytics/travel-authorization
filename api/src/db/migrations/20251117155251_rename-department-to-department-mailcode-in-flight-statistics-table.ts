import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("flight_statistics", (table) => {
    table.renameColumn("department", "department_mailcode")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("flight_statistics", (table) => {
    table.renameColumn("department_mailcode", "department")
  })
}
