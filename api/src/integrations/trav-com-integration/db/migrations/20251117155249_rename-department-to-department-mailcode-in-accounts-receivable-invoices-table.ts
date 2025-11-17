import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("ARInvoicesNoHealth", (table) => {
    table.renameColumn("Department", "DepartmentMailcode")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("ARInvoicesNoHealth", (table) => {
    table.renameColumn("DepartmentMailcode", "Department")
  })
}
