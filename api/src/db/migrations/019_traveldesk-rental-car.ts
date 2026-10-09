import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskRentalCar", function (t) {
    t.increments("rentalVehicleID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")

    t.string("pickUpCity").notNullable()
    t.string("pickUpLocation").notNullable()
    t.string("pickUpLocOther")
    t.string("dropOffCity")
    t.string("dropOffLocation")
    t.string("dropOffLocOther")
    t.boolean("sameDropOffLocation").notNullable().defaultTo(true)
    t.boolean("matchFlightTimes").notNullable().defaultTo(false)

    t.string("vehicleTypeChangeInd")
    t.string("vehicleType").notNullable()
    t.string("vehicleChangeRationale")

    t.datetime("pickUpDate").notNullable()
    t.datetime("dropOffDate").notNullable()
    t.string("additionalNotes")

    t.string("status").notNullable()

    t.string("reservedVehicleInfo")
    t.string("booking")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskRentalCar")
}
