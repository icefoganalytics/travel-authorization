import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.string("wizard_step_name", 255)
    table.dropColumn("step_number")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("step_number").notNullable().defaultTo(1)
    table.dropColumn("wizard_step_name")
  })
}
