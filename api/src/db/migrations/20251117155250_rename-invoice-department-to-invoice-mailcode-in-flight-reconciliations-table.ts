import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("flight_reconciliations", (table) => {
    table.renameColumn("invoice_department", "invoice_department_mailcode")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("flight_reconciliations", (table) => {
    table.renameColumn("invoice_department_mailcode", "invoice_department")
  })
}
