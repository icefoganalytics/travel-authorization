import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_desk_questions
    SET
      request_type = CASE request_type
        WHEN 'Flight' THEN 'flight'
        WHEN 'Hotel' THEN 'hotel'
        WHEN 'Transportation' THEN 'transportation'
        WHEN 'Rental Car' THEN 'rental_car'
        ELSE request_type
      END
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_desk_questions
    SET
      request_type = CASE request_type
        WHEN 'flight' THEN 'Flight'
        WHEN 'hotel' THEN 'Hotel'
        WHEN 'transportation' THEN 'Transportation'
        WHEN 'rental_car' THEN 'Rental Car'
        ELSE request_type
      END
  `)
}
