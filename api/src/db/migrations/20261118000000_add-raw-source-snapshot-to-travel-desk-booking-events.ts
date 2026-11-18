import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.jsonb("raw_source_snapshot").nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.dropColumn("raw_source_snapshot")
  })
}
