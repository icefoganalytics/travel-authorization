import { Knex } from "knex"

// NOTE: Most tables store only city strings with no province column, so the
// join to locations matches on city name only. Where a city exists in multiple
// provinces (e.g. "Cornwall" in ON and PE), an arbitrary match is used.
// travel_desk_travel_requests is the exception — it has a province column and
// uses an exact match.

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_requests
    SET
      depart_location = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_flight_requests.depart_location = locations.city
      AND travel_desk_flight_requests.depart_location NOT LIKE '% (%)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_requests
    SET
      arrive_location = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_flight_requests.arrive_location = locations.city
      AND travel_desk_flight_requests.arrive_location NOT LIKE '% (%)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_hotels
    SET
      city = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_hotels.city = locations.city
      AND travel_desk_hotels.city NOT LIKE '% (%)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_rental_cars
    SET
      pick_up_city = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_rental_cars.pick_up_city = locations.city
      AND travel_desk_rental_cars.pick_up_city NOT LIKE '% (%)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_rental_cars
    SET
      drop_off_city = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_rental_cars.drop_off_city = locations.city
      AND travel_desk_rental_cars.drop_off_city NOT LIKE '% (%)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_other_transportations
    SET
      depart = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_other_transportations.depart = locations.city
      AND travel_desk_other_transportations.depart NOT LIKE '% (%)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_other_transportations
    SET
      arrive = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_other_transportations.arrive = locations.city
      AND travel_desk_other_transportations.arrive NOT LIKE '% (%)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_travel_requests
    SET
      city = format('%s (%s)', locations.city, locations.province)
    FROM
      locations
    WHERE
      travel_desk_travel_requests.city = locations.city
      AND travel_desk_travel_requests.province = locations.province
      AND travel_desk_travel_requests.city NOT LIKE '% (%)'
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_requests
    SET
      depart_location = REGEXP_REPLACE(depart_location, ' [(][A-Z]{2}[)]$', '')
    WHERE
      depart_location LIKE '% (__)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_requests
    SET
      arrive_location = REGEXP_REPLACE(arrive_location, ' [(][A-Z]{2}[)]$', '')
    WHERE
      arrive_location LIKE '% (__)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_hotels
    SET
      city = REGEXP_REPLACE(city, ' [(][A-Z]{2}[)]$', '')
    WHERE
      city LIKE '% (__)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_rental_cars
    SET
      pick_up_city = REGEXP_REPLACE(pick_up_city, ' [(][A-Z]{2}[)]$', '')
    WHERE
      pick_up_city LIKE '% (__)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_rental_cars
    SET
      drop_off_city = REGEXP_REPLACE(drop_off_city, ' [(][A-Z]{2}[)]$', '')
    WHERE
      drop_off_city LIKE '% (__)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_other_transportations
    SET
      depart = REGEXP_REPLACE(depart, ' [(][A-Z]{2}[)]$', '')
    WHERE
      depart LIKE '% (__)'
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_desk_other_transportations
    SET
      arrive = REGEXP_REPLACE(arrive, ' [(][A-Z]{2}[)]$', '')
    WHERE
      arrive LIKE '% (__)'
  `)

  await knex.raw(/* sql */ `
    UPDATE travel_desk_travel_requests
    SET
      city = REGEXP_REPLACE(city, ' [(][A-Z]{2}[)]$', '')
    WHERE
      city LIKE '% (__)'
  `)
}
