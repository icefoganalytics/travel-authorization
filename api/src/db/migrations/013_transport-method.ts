import * as knex from "knex"

exports.up = function (knex: knex.Knex) {
  return knex.schema.createTable("transportMethod", function (t) {
    t.increments("id").notNullable().primary()
    t.string("method").notNullable()
  })
}

exports.down = function (knex: knex.Knex) {
  return knex.schema.dropTable("transportMethod")
}
