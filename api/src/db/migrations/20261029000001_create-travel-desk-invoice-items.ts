import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (transaction) => {
    await transaction.schema.createTable("travel_desk_invoice_items", (table) => {
      table.increments("id").primary()
      table.integer("travel_desk_invoice_id").notNullable()
      table.integer("travel_desk_product_type_id").notNullable()
      table.integer("travel_desk_flight_segment_id").nullable()
      table.integer("source_air_segment_number")
      table.integer("source_service_fee_event_id")
      table.string("passenger_name")
      table.string("ticket_number")
      table.string("vendor")
      table.text("description")
      table.enu("sale_type", ["Sale", "Refund", "Void"]).notNullable()
      table.decimal("gross_amount", 18, 3).notNullable()
      table.integer("position").notNullable()

      table.timestamps(true, true)
      table.timestamp("deleted_at")

      table
        .foreign("travel_desk_invoice_id")
        .references("id")
        .inTable("travel_desk_invoices")
        .onDelete("RESTRICT")
      table
        .foreign("travel_desk_product_type_id")
        .references("id")
        .inTable("travel_desk_product_types")
        .onDelete("RESTRICT")
      table
        .foreign("travel_desk_flight_segment_id")
        .references("id")
        .inTable("travel_desk_flight_segments")
        .onDelete("RESTRICT")
      table.check(
        `NOT (source_air_segment_number IS NOT NULL AND source_service_fee_event_id IS NOT NULL)`,
        [],
        "travel_desk_invoice_items_source_identity_exclusive"
      )
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("travel_desk_invoice_items")
}
