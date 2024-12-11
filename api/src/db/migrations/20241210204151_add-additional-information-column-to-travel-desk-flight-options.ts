import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("travel_desk_flight_options", (table) => {
    table.text("additional_information")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("travel_desk_flight_options", (table) => {
    table.dropColumn("additional_information")
  })
}
