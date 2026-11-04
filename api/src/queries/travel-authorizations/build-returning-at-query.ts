import { sql, type Literal } from "@sequelize/core"

export function buildReturningAtQuery(): Literal {
  // A missing date on the last segment falls back to the last stop.
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
          segment_number DESC,
          id DESC
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
          departure_date DESC,
          departure_time DESC,
          id DESC
        LIMIT
          1
      )
    )
  `
}

export default buildReturningAtQuery
