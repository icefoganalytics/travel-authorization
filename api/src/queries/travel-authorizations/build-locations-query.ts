import { sql, type Literal } from "@sequelize/core"

export function buildLocationsQuery(): Literal {
  // Match the serializer's insertion-ordered Map: segment departure then arrival,
  // deduplicated by location identity. Stops are used only when no segments exist.
  // PostgreSQL arrays compare label by label, including subsequent destinations.
  return sql`
    (
      WITH
        ordered_locations AS (
          SELECT
            location_id,
            ROW_NUMBER() OVER (
              ORDER BY
                segment_number,
                segment_id,
                endpoint
            ) AS position
          FROM
            (
              SELECT
                segment_number,
                id AS segment_id,
                0 AS endpoint,
                departure_location_id AS location_id
              FROM
                travel_segments
              WHERE
                travel_authorization_id = "TravelAuthorization".id
              UNION ALL
              SELECT
                segment_number,
                id AS segment_id,
                1 AS endpoint,
                arrival_location_id AS location_id
              FROM
                travel_segments
              WHERE
                travel_authorization_id = "TravelAuthorization".id
            ) AS segment_locations
          UNION ALL
          SELECT
            location_id,
            ROW_NUMBER() OVER (
              ORDER BY
                departure_date,
                departure_time,
                id
            ) AS position
          FROM
            stops
          WHERE
            travel_authorization_id = "TravelAuthorization".id
            AND NOT EXISTS (
              SELECT
                1
              FROM
                travel_segments
              WHERE
                travel_authorization_id = "TravelAuthorization".id
            )
        ),
        unique_locations AS (
          SELECT
            location_id,
            MIN(position) AS position
          FROM
            ordered_locations
          GROUP BY
            location_id
        )
      SELECT
        COALESCE(
          ARRAY_AGG(
            locations.city || ' (' || locations.province || ')'
            ORDER BY
              position
          ),
          ARRAY[]::text[]
        )
      FROM
        unique_locations
        INNER JOIN locations ON locations.id = unique_locations.location_id
    )
  `
}

export default buildLocationsQuery
