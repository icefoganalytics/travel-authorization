import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("estimated_primary_destination_id").nullable()
    table.integer("actual_primary_destination_id").nullable()
  })

  // Preserve existing destinations once; future multi-city selections are explicit.
  await knex.raw(`
    WITH itineraries AS (
      SELECT
        travel_authorizations.id AS travel_authorization_id,
        travel_segments.is_actual,
        CASE
          WHEN travel_segments.is_actual
            THEN COALESCE(travel_authorizations.trip_type_actual, travel_authorizations.trip_type_estimate)
          ELSE travel_authorizations.trip_type_estimate
        END AS trip_type,
        (ARRAY_AGG(
          travel_segments.departure_location_id
          ORDER BY travel_segments.segment_number, travel_segments.id
        ))[1] AS origin_location_id,
        ARRAY_AGG(
          travel_segments.arrival_location_id
          ORDER BY travel_segments.segment_number, travel_segments.id
        ) AS arrival_location_ids
      FROM travel_authorizations
      JOIN travel_segments ON travel_segments.travel_authorization_id = travel_authorizations.id
      GROUP BY travel_authorizations.id, travel_segments.is_actual
    ),
    destinations AS (
      SELECT
        travel_authorization_id,
        is_actual,
        CASE
          WHEN trip_type = 'round_trip' THEN arrival_location_ids[1]
          WHEN trip_type = 'multi_city'
            AND CARDINALITY(arrival_location_ids) > 1
            AND origin_location_id = arrival_location_ids[CARDINALITY(arrival_location_ids)]
            THEN arrival_location_ids[CARDINALITY(arrival_location_ids) - 1]
          WHEN trip_type IN ('one_way', 'multi_city')
            THEN arrival_location_ids[CARDINALITY(arrival_location_ids)]
          ELSE NULL
        END AS location_id
      FROM itineraries
    ),
    primary_destinations AS (
      SELECT
        travel_authorization_id,
        MAX(location_id) FILTER (WHERE NOT is_actual) AS estimated_location_id,
        MAX(location_id) FILTER (WHERE is_actual) AS actual_location_id
      FROM destinations
      GROUP BY travel_authorization_id
    )
    UPDATE travel_authorizations
    SET
      estimated_primary_destination_id = primary_destinations.estimated_location_id,
      actual_primary_destination_id = primary_destinations.actual_location_id
    FROM primary_destinations
    WHERE travel_authorizations.id = primary_destinations.travel_authorization_id
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table
      .foreign("estimated_primary_destination_id")
      .references("locations.id")
      .onDelete("RESTRICT")
    table
      .foreign("actual_primary_destination_id")
      .references("locations.id")
      .onDelete("RESTRICT")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("estimated_primary_destination_id")
    table.dropColumn("actual_primary_destination_id")
  })
}
