import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("transportMethod", function (t) {
    t.increments("id").notNullable().primary()
    t.string("method").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("transportMethod")
}
