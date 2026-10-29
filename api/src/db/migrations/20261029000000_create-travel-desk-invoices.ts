import { Knex } from "knex"

const BUILT_IN_PRODUCT_TYPES = [
  { code: "air", name: "Air" },
  { code: "service-fee", name: "Service Fee" },
  { code: "credit", name: "Credit" },
  { code: "change-fee", name: "Change Fee" },
]

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (transaction) => {
    await transaction.schema.createTable("travel_desk_product_types", (table) => {
      table.increments("id").primary()
      table.string("code").notNullable().unique()
      table.string("name").notNullable().unique()
      table.text("description")
      table.timestamps(true, true)
      table.timestamp("deleted_at")
    })

    await transaction.schema.createTable("travel_desk_invoices", (table) => {
      table.increments("id").primary()
      table
        .integer("travel_desk_travel_request_id")
        .notNullable()
        .references("id")
        .inTable("travel_desk_travel_requests")
        .onDelete("RESTRICT")
      table.string("record_locator").notNullable()
      table.integer("source_booking_event_id").notNullable()
      table.jsonb("source_snapshot").notNullable()
      table.string("currency_code", 3).notNullable()
      table.string("invoice_number")
      table.date("invoice_date")
      table.string("warrant_number")
      table.string("client_number")
      table.string("client_name")
      table.string("department")
      table.string("mailcode")
      table.string("iata_number")
      table.string("booking_agent_name")
      table.string("ticketing_agent_name")
      table.date("booking_date")
      table.decimal("gross_amount", 18, 3).notNullable()
      table.timestamps(true, true)
      table.timestamp("deleted_at")
    })

    await transaction.schema.createTable("travel_desk_invoice_items", (table) => {
      table.increments("id").primary()
      table
        .integer("travel_desk_invoice_id")
        .notNullable()
        .references("id")
        .inTable("travel_desk_invoices")
        .onDelete("RESTRICT")
      table
        .integer("travel_desk_product_type_id")
        .notNullable()
        .references("id")
        .inTable("travel_desk_product_types")
        .onDelete("RESTRICT")
      table
        .integer("travel_desk_flight_segment_id")
        .nullable()
        .references("id")
        .inTable("travel_desk_flight_segments")
        .onDelete("RESTRICT")
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
      table.check(
        `NOT (source_air_segment_number IS NOT NULL AND source_service_fee_event_id IS NOT NULL)`,
        [],
        "travel_desk_invoice_items_source_identity_exclusive"
      )
    })

    await transaction("travel_desk_product_types").insert(BUILT_IN_PRODUCT_TYPES)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (transaction) => {
    await transaction.schema.dropTable("travel_desk_invoice_items")
    await transaction.schema.dropTable("travel_desk_invoices")
    await transaction.schema.dropTable("travel_desk_product_types")
  })
}
