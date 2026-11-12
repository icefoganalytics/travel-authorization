import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.dropUnique(["external_travelport_identifier"])
    table.unique(["external_travelport_identifier"], {
      indexName: "travel_desk_booking_events_active_external_identifier_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_booking_events", (table) => {
    table.dropIndex(
      ["external_travelport_identifier"],
      "travel_desk_booking_events_active_external_identifier_unique"
    )
    table.unique(["external_travelport_identifier"])
  })
}
