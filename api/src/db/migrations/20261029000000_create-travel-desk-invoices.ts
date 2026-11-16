import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_invoices", (table) => {
    table.increments("id").primary()
    table.integer("travel_desk_travel_request_id").notNullable()
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

    table
      .foreign("travel_desk_travel_request_id")
      .references("travel_desk_travel_requests.id")
      .onDelete("RESTRICT")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("travel_desk_invoices")
}
