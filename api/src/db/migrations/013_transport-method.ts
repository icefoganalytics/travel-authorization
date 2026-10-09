import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("transportMethod", function (t) {
    t.increments("id").notNullable().primary()
    t.string("method").notNullable()
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("transportMethod")
}
