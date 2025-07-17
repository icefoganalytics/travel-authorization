import { sql, type Literal } from "@sequelize/core"

export function buildIsBeforeTripEndQuery(): Literal {
  const isBeforeTripEndQuery = sql`
    (
      SELECT
        travel_authorization_id
      FROM
        (
          SELECT
            travel_authorizations.id AS travel_authorization_id,
            COALESCE(
              travel_authorizations.date_back_to_work_estimate::timestamp,
              MAX(
                travel_segment_estimates.departure_on + COALESCE(
                  travel_segment_estimates.departure_time,
                  '00:00:00'::time
                )
              )
            ) AS returning_at
          FROM
            travel_authorizations
            INNER JOIN travel_segments AS travel_segment_estimates ON travel_authorizations.id = travel_segment_estimates.travel_authorization_id
            AND travel_segment_estimates.is_actual = false
          GROUP BY
            travel_authorizations.id
        ) AS travel_periods
      WHERE
        :currentDate < travel_periods.returning_at
    )
  `
  return isBeforeTripEndQuery
}

export default buildIsBeforeTripEndQuery
