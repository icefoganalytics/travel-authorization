import * as knex from "knex"

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("expenses", function (table) {
    table.string("expenseType", 255).notNullable()
  })
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("expenses", function (table) {
    table.dropColumn("expenseType")
  })
}
