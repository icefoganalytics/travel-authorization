import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("ARInvoicesNoHealth", (table) => {
    table.specificType("BookingDate", "datetime").nullable().alter()
    table.specificType("SystemDate", "datetime").nullable().alter()
  })

  await knex.schema.alterTable("ARInvoiceDetailsNoHealth", (table) => {
    table.specificType("TravelDate", "datetime").nullable().alter()
    table.specificType("ReturnDate", "datetime").nullable().alter()
  })

  await knex.schema.alterTable("segmentsNoHealth", (table) => {
    table.specificType("DepartureInfo", "datetime").nullable().alter()
    table.specificType("ArrivalInfo", "datetime").nullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("ARInvoicesNoHealth", (table) => {
    table.specificType("BookingDate", "datetime2").nullable().alter()
    table.specificType("SystemDate", "datetime2").nullable().alter()
  })

  await knex.schema.alterTable("ARInvoiceDetailsNoHealth", (table) => {
    table.specificType("TravelDate", "datetime2").nullable().alter()
    table.specificType("ReturnDate", "datetime2").nullable().alter()
  })

  await knex.schema.alterTable("segmentsNoHealth", (table) => {
    table.specificType("DepartureInfo", "datetime2").nullable().alter()
    table.specificType("ArrivalInfo", "datetime2").nullable().alter()
  })
}
