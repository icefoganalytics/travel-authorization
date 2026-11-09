import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("stops", function (t) {
    t.increments("id").notNullable().primary()
    t.integer("taid").notNullable()
    t.integer("locationId")
    t.specificType("departureDate", "DATE")
    t.time("departureTime")
    t.string("transport")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("stops")
}
