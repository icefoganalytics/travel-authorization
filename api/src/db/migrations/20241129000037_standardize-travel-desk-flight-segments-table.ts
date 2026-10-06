import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_flight_segments", (table) => {
    table.increments("id")
    table.integer("flight_option_id").notNullable()
    table.string("flight_number").notNullable()
    table.timestamp("depart_at").notNullable()
    table.string("depart_location").notNullable()
    table.timestamp("arrive_at").notNullable()
    table.string("arrive_location").notNullable()
    table.string("duration").notNullable()
    table.string("status").notNullable()
    table.string("class").notNullable()
    table.integer("sort_order").defaultTo(1)

    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table
      .foreign("flight_option_id")
      .references("travelDeskFlightOption.flightOptionID")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_segments
    SET
      id = "flightSegmentID",
      flight_option_id = "flightOptionID",
      flight_number = "travelDeskFlightSegment"."flightNumber",
      depart_at = "travelDeskFlightSegment"."departDate",
      depart_location = "travelDeskFlightSegment"."departLocation",
      arrive_at = "travelDeskFlightSegment"."arriveDate",
      arrive_location = "travelDeskFlightSegment"."arriveLocation",
      duration = "travelDeskFlightSegment"."duration",
      "status" = "travelDeskFlightSegment"."status",
      "class" = "travelDeskFlightSegment"."class",
      sort_order = "travelDeskFlightSegment"."sortOrder"
    FROM
      "travelDeskFlightSegment"
  `)

  await knex.schema.dropTable("travelDeskFlightSegment")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("travelDeskFlightSegment", (table) => {
    table.increments("flightSegmentID")
    table.integer("flightOptionID").notNullable()
    table.string("flightNumber")
    table.timestamp("departDate")
    table.string("departLocation")
    table.timestamp("arriveDate")
    table.string("arriveLocation")
    table.string("duration")
    table.string("status")
    table.string("class")
    table.integer("sortOrder").notNullable()

    table
      .foreign("flightOptionID")
      .references("travelDeskFlightOption.flightOptionID")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE "travelDeskFlightSegment"
    SET
      "flightRequestID" = id,
      "flightOptionID" = flight_option_id,
      "flightNumber" = travel_desk_flight_segments.flight_number,
      "departDate" = travel_desk_flight_segments.depart_at,
      "departLocation" = travel_desk_flight_segments.depart_location,
      "arriveDate" = travel_desk_flight_segments.arrive_at,
      "arriveLocation" = travel_desk_flight_segments.arrive_location,
      "duration" = travel_desk_flight_segments.duration,
      "status" = travel_desk_flight_segments."status",
      "class" = travel_desk_flight_segments."class",
      "sortOrder" = travel_desk_flight_segments.sort_order
    FROM
      travel_desk_flight_segments
  `)

  await knex.schema.dropTable("travel_desk_flight_segments")
}
