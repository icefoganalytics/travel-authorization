import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_invoice_items", (table) => {
    table.increments("id").primary()
    table.integer("travel_desk_invoice_id").notNullable()
    table.integer("travel_desk_flight_segment_id").nullable()
    table.string("product_type").notNullable()
    table.integer("source_air_segment_number")
    table.integer("source_service_fee_event_external_identifier")
    table.string("passenger_name")
    table.string("ticket_number")
    table.string("vendor")
    table.text("description")
    table.string("sale_type").notNullable()
    table.decimal("gross_amount", 18, 3).notNullable()
    table.integer("position").notNullable()

    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table
      .foreign("travel_desk_invoice_id")
      .references("travel_desk_invoices.id")
      .onDelete("RESTRICT")
    table
      .foreign("travel_desk_flight_segment_id")
      .references("travel_desk_flight_segments.id")
      .onDelete("RESTRICT")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("travel_desk_invoice_items")
}
