import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.string("travelport_record_locator", 6).nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.dropColumn("travelport_record_locator")
  })
}
