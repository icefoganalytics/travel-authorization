import { sql, type Literal } from "@sequelize/core"

export function buildDepartingAtQuery(): Literal {
  // A missing date on the first segment falls back to the first stop.
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
          segment_number ASC,
          id ASC
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
          departure_date ASC,
          departure_time ASC,
          id ASC
        LIMIT
          1
      )
    )
  `
}

export default buildDepartingAtQuery
