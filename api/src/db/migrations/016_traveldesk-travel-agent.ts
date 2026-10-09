import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskTravelAgent", function (t) {
    t.increments("agencyID").notNullable().primary()

    t.string("agencyName").notNullable()
    t.string("agencyInfo")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskTravelAgent")
}
