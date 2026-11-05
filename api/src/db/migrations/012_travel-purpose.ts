import * as knex from "knex"

exports.up = function (knex: knex.Knex) {
  return knex.schema.createTable("travelPurpose", function (t) {
    t.increments("id").notNullable().primary()
    t.string("purpose").notNullable()
  })
}

exports.down = function (knex: knex.Knex) {
  return knex.schema.dropTable("travelPurpose")
}
