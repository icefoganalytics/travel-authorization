import * as knex from "knex"

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("forms", function (table) {
    table.string("accommodationType")
  })
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("forms", function (table) {
    table.dropColumn("accommodationType")
  })
}
