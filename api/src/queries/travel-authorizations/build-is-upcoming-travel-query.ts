import { literal } from "@sequelize/core"
import { type Literal } from "sequelize/lib/utils"

export function buildIsUpcomingTravelQuery(): Literal {
  const isUpcomingTravelQuery = /* sql */ `
    (
      SELECT
        travel_authorization_id
      FROM
        (
          SELECT
            travel_authorizations.id AS travel_authorization_id,
            MIN(
              travel_segments.departure_on + COALESCE(travel_segments.departure_time, '00:00:00'::time)
            ) AS departing_at
          FROM
            travel_authorizations
            INNER JOIN travel_segments ON travel_authorizations.id = travel_segments.travel_authorization_id
          GROUP BY
            travel_authorizations.id
        ) AS travel_periods
      WHERE
        :currentDate < travel_periods.departing_at
    )
  `
  return literal(isUpcomingTravelQuery)
}

export default buildIsUpcomingTravelQuery
