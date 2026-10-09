import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskFlightSegment", function (t) {
    t.increments("flightSegmentID").notNullable().primary()
    // t.integer("requestID").unsigned().notNullable();
    // t.foreign("requestID").references("requestID").inTable("travelDeskTravelRequest").onDelete("CASCADE");

    t.string("flightNumber")

    t.datetime("departDate")
    t.string("departLocation")
    t.datetime("arriveDate")
    t.string("arriveLocation")

    t.string("duration")
    t.string("status")
    t.string("class")

    t.integer("sortOrder").unsigned().notNullable()

    t.integer("flightOptionID").unsigned().notNullable()
    t.foreign("flightOptionID")
      .references("flightOptionID")
      .inTable("travelDeskFlightOption")
      .onDelete("CASCADE")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskFlightSegment")
}
