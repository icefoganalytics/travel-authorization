import { sql, type Literal } from "@sequelize/core"

export function buildListSortAttributeQuery(field: string): Literal | undefined {
  switch (field) {
    case "name":
      return sql`
        (
          SELECT
            COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
          FROM
            users
          WHERE
            users.id = "TravelAuthorization".user_id
        )
      `
    case "purposeText":
      return sql`
        COALESCE(
          (
            SELECT
              purpose
            FROM
              travel_purposes
            WHERE
              travel_purposes.id = "TravelAuthorization".purpose_id
          ),
          ''
        )
      `
    case "departingAt":
      return buildBoundaryDepartureQuery(false)
    case "returningAt":
      return buildBoundaryDepartureQuery(true)
    case "locations":
      return buildLocationsQuery()
    case "travelDeskStatus":
      return sql`
        (
          SELECT
            status
          FROM
            travel_desk_travel_requests
          WHERE
            travel_authorization_id = "TravelAuthorization".id
        )
      `
    default:
      return undefined
  }
}

function buildBoundaryDepartureQuery(isReturning: boolean): Literal {
  const direction = isReturning ? sql`DESC` : sql`ASC`

  // Select the boundary segment first: a missing date falls back to the boundary stop,
  // not to another dated segment. Null times mean midnight, just like departureAt.
  return sql`
    COALESCE(
      (
        SELECT
          departure_on + COALESCE(departure_time, '00:00:00'::time)
        FROM
          travel_segments
        WHERE
          travel_authorization_id = "TravelAuthorization".id
        ORDER BY
          segment_number ${direction},
          id ${direction}
        LIMIT
          1
      ),
      (
        SELECT
          departure_date + COALESCE(departure_time, '00:00:00'::time)
        FROM
          stops
        WHERE
          travel_authorization_id = "TravelAuthorization".id
        ORDER BY
          departure_date ${direction},
          departure_time ${direction},
          id ${direction}
        LIMIT
          1
      )
    )
  `
}

function buildLocationsQuery(): Literal {
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

export default buildListSortAttributeQuery
