import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    INSERT INTO
      flight_statistics (
        id,
        department,
        destination_airport_code,
        destination_city,
        destination_province,
        total_trips,
        total_round_trips,
        total_days,
        total_expenses,
        total_flight_cost,
        total_round_trip_cost,
        average_duration_days,
        average_expenses_per_day,
        average_round_trip_flight_cost
      )
    SELECT
      id,
      dept,
      "arrAirport",
      "finalDestinationCity",
      "finalDestinationProvince",
      "totalTrips",
      "totalRoundTrips",
      "days",
      "totalExpenses",
      "totalFlightCost",
      "roundTripCost",
      "averageDurationDays",
      "averageExpensesPerDay",
      "averageRoundTripFlightCost"
    FROM
      "StatisticsRecord"
    WHERE
      dept IS NOT NULL AND TRIM(dept) != ''
      AND "arrAirport" IS NOT NULL AND TRIM("arrAirport") != ''
      AND "finalDestinationCity" IS NOT NULL AND TRIM("finalDestinationCity") != ''
      AND "finalDestinationProvince" IS NOT NULL AND TRIM("finalDestinationProvince") != ''
      AND "totalTrips" IS NOT NULL
      AND "totalRoundTrips" IS NOT NULL
      AND "days" IS NOT NULL
      AND "totalExpenses" IS NOT NULL
      AND "totalFlightCost" IS NOT NULL
      AND "roundTripCost" IS NOT NULL
      AND "averageDurationDays" IS NOT NULL
      AND "averageExpensesPerDay" IS NOT NULL
      AND "averageRoundTripFlightCost" IS NOT NULL
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    INSERT INTO
      "StatisticsRecord" (
        id,
        dept,
        "arrAirport",
        "finalDestinationCity",
        "finalDestinationProvince",
        "totalTrips",
        "totalRoundTrips",
        "days",
        "totalExpenses",
        "totalFlightCost",
        "roundTripCost",
        "averageDurationDays",
        "averageExpensesPerDay",
        "averageRoundTripFlightCost"
      )
    SELECT
      id,
      department,
      destination_airport_code,
      destination_city,
      destination_province,
      total_trips,
      total_round_trips,
      total_days,
      total_expenses,
      total_flight_cost,
      total_round_trip_cost,
      average_duration_days,
      average_expenses_per_day,
      average_round_trip_flight_cost
    FROM
      flight_statistics
  `)
}
