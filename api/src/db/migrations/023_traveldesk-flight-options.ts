import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskFlightOption", function (t) {
    t.increments("flightOptionID").notNullable().primary()
    t.integer("flightRequestID").unsigned().notNullable()
    t.foreign("flightRequestID")
      .references("flightRequestID")
      .inTable("travelDeskFlightRequest")
      .onDelete("CASCADE")

    t.string("cost")
    t.string("flightPreference")
    t.string("leg")
    t.string("duration")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskFlightOption")
}
