import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("travelDeskFlightRequest", function (t) {
    t.increments("flightRequestID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")

    t.string("departLocation").notNullable()
    t.string("arriveLocation").notNullable()
    t.date("date").notNullable()
    t.string("timePreference").notNullable()
    t.string("seatPreference").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("travelDeskFlightRequest")
}
