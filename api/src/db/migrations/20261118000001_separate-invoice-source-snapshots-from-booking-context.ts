import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.renameColumn("source_snapshot", "booking_context")
  })
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.jsonb("source_snapshot").nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.dropColumn("source_snapshot")
  })
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.renameColumn("booking_context", "source_snapshot")
  })
}
