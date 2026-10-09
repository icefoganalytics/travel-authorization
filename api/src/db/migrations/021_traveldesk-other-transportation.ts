import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskOtherTransportation", function (t) {
    t.increments("transportationID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")

    t.string("depart").notNullable()
    t.string("arrive").notNullable()

    t.string("transportationType")

    t.date("date").notNullable()

    t.string("additionalNotes")

    t.string("status").notNullable()

    t.string("reservedTranspInfo")
    t.string("booking")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskOtherTransportation")
}
