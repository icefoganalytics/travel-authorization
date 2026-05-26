import { sql, type Literal } from "@sequelize/core"

export function buildIsActiveTripQuery(): Literal {
  const isActiveTripQuery = sql`
    (
      SELECT
        travel_authorization_id
      FROM
        (
          SELECT
            travel_authorizations.id AS travel_authorization_id,
            MIN(
              travel_segments.departure_on + COALESCE(travel_segments.departure_time, '00:00:00'::time)
            ) AS departing_at,
            COALESCE(
              travel_authorizations.date_back_to_work_estimate::timestamp,
              MAX(
                travel_segments.departure_on + COALESCE(travel_segments.departure_time, '00:00:00'::time)
              )
            ) AS returning_at
          FROM
            travel_authorizations
            INNER JOIN travel_segments ON travel_authorizations.id = travel_segments.travel_authorization_id
            AND travel_segments.is_actual = false
          GROUP BY
            travel_authorizations.id
        ) AS travel_periods
      WHERE
        :currentDate >= travel_periods.departing_at
        AND :currentDate <= travel_periods.returning_at
    )
  `
  return isActiveTripQuery
}

export default buildIsActiveTripQuery
