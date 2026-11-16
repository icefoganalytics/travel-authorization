import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.renameColumn("database_timestamp", "external_created_at")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.renameColumn("external_created_at", "database_timestamp")
  })
}
