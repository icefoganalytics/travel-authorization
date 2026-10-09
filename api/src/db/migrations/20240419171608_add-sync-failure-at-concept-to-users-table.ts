import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.datetime("last_sync_success_at").nullable()
    table.datetime("last_sync_failure_at").nullable()
  })

  await knex.raw(/* sql */ `
    UPDATE users
    SET
      last_sync_success_at = last_employee_directory_sync_at
  `)

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("last_employee_directory_sync_at")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.datetime("last_employee_directory_sync_at").nullable()
  })

  await knex.raw(/* sql */ `
    UPDATE users
    SET
      last_employee_directory_sync_at = last_sync_success_at
  `)

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("last_sync_success_at")
    table.dropColumn("last_sync_failure_at")
  })
}
