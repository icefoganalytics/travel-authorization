import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.renameColumn("record_locator", "booking_reference")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.renameColumn("booking_reference", "record_locator")
  })
}
