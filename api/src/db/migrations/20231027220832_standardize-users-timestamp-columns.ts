import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamps(true, true)
  })

  await knex.raw(`
    UPDATE users
      SET created_at = create_date
  `)

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("create_date")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("create_date").notNullable().defaultTo(knex.fn.now())
  })

  await knex.raw(`
    UPDATE users
      SET create_date = created_at
  `)

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("created_at")
    table.dropColumn("updated_at")
  })
}
