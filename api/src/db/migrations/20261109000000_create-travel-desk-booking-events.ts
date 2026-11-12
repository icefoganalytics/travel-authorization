import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_booking_events", (table) => {
    table.increments("id").primary()
    table.integer("external_travelport_identifier").notNullable()
    table.integer("booking_file_version_number")
    table.string("event_type")
    table.string("record_locator")
    table.string("reservation_system_description")
    table.string("owning_agency_name")
    table.string("transaction_agency_name")
    table.string("transaction_agent")
    table.string("creating_agency_international_air_transport_association_number")

    table.timestamp("database_timestamp").notNullable()
    table.timestamp("host_event_timestamp")
    table.timestamp("passenger_name_record_created_at")
    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table.jsonb("passengers").notNullable()
    table.jsonb("air_reservation_segments").notNullable()
    table.jsonb("service_fee_transaction")

    table.unique(["external_travelport_identifier"], {
      indexName: "travel_desk_booking_events_active_external_identifier_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("travel_desk_booking_events")
}
