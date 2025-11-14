import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("flight_statistics", (table) => {
    table.increments("id").primary()

    table.string("department", 255).notNullable()
    table.string("destination_airport_code", 255).notNullable()
    table.string("destination_city", 255).notNullable()
    table.string("destination_province", 255).notNullable()
    table.integer("total_trips").notNullable()
    table.integer("total_round_trips").notNullable()
    table.integer("total_days").notNullable()
    table.float("total_expenses").notNullable()
    table.float("total_flight_cost").notNullable()
    table.float("total_round_trip_cost").notNullable()
    table.float("average_duration_days").notNullable()
    table.float("average_expenses_per_day").notNullable()
    table.float("average_round_trip_flight_cost").notNullable()

    table.timestamps(true, true)
    table.timestamp("deleted_at")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("flight_statistics")
}
