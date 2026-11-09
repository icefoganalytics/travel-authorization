import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("perDiems", function (t) {
    t.increments("id").notNullable().primary()
    t.string("claim")
    t.string("location")
    t.float("amount")
    t.string("currency")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("perDiems")
}
