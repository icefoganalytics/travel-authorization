import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("StatisticsRecord")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("StatisticsRecord", (table) => {
    table.increments("id").primary()

    table.string("dept")
    table.string("arrAirport")
    table.float("totalExpenses")
    table.float("totalFlightCost")
    table.integer("days")
    table.integer("totalTrips")
    table.integer("totalRoundTrips")
    table.float("roundTripCost")
    table.string("finalDestinationCity")
    table.string("finalDestinationProvince")
    table.float("averageDurationDays")
    table.float("averageExpensesPerDay")
    table.float("averageRoundTripFlightCost")
  })
}
