import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("StatisticsRecord", function (t) {
    t.increments("id").notNullable().primary()

    t.string("dept")
    t.string("arrAirport")
    t.float("totalExpenses")
    t.float("totalFlightCost")
    t.integer("days")
    t.integer("totalTrips")
    t.integer("totalRoundTrips")
    t.float("roundTripCost")
    t.string("finalDestinationCity")
    t.string("finalDestinationProvince")
    t.float("averageDurationDays")
    t.float("averageExpensesPerDay")
    t.float("averageRoundTripFlightCost")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("StatisticsRecord")
}
