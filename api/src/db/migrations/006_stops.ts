import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("stops", function (t) {
    t.increments("id").notNullable().primary()
    t.integer("taid").notNullable()
    t.integer("locationId")
    t.specificType("departureDate", "DATE")
    t.time("departureTime")
    t.string("transport")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("stops")
}
