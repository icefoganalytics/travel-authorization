import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_flight_options", (table) => {
    table.increments("id")
    table.integer("flight_request_id").notNullable()
    table.string("cost").notNullable()
    table.integer("flight_preference_order").nullable()
    table.string("leg").notNullable()
    table.string("duration").notNullable()

    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table
      .foreign("flight_request_id")
      .references("travel_desk_flight_requests.id")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_options
    SET
      id = "flightOptionID",
      flight_request_id = "flightRequestID",
      cost = "travelDeskFlightOption"."cost",
      leg = "travelDeskFlightOption"."leg",
      duration = "travelDeskFlightOption"."duration",
      flight_preference_order = "flightPreference"::integer
    FROM
      "travelDeskFlightOption"
  `)

  await knex.schema.alterTable("travel_desk_flight_segments", (table) => {
    table.dropForeign(["flight_option_id"])
  })

  await knex.schema.dropTable("travelDeskFlightOption")

  await knex.schema.alterTable("travel_desk_flight_segments", (table) => {
    table
      .foreign("flight_option_id")
      .references("travel_desk_flight_options.id")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("travelDeskFlightOption", (table) => {
    table.increments("flightOptionID")
    table.integer("flightRequestID").notNullable()
    table.string("cost")
    table.string("flightPreference")
    table.string("leg")
    table.string("duration")

    table
      .foreign("flightRequestID")
      .references("travel_desk_flight_requests.id")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE "travelDeskFlightOption"
    SET
      "flightOptionID" = id,
      "flightRequestID" = flight_request_id,
      "cost" = travel_desk_flight_options.cost,
      "flightPreference" = flight_preference_order,
      "leg" = travel_desk_flight_options.leg,
      "duration" = travel_desk_flight_options.duration
    FROM
      travel_desk_flight_options
  `)

  await knex.schema.alterTable("travel_desk_flight_segments", (table) => {
    table.dropForeign(["flight_option_id"])
  })

  await knex.schema.dropTable("travel_desk_flight_options")

  await knex.schema.alterTable("travel_desk_flight_segments", (table) => {
    table
      .foreign("flight_option_id")
      .references("travelDeskFlightOption.flightOptionID")
      .onDelete("CASCADE")
  })
}
