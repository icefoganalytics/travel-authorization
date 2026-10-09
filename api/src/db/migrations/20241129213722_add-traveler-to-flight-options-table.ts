import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_flight_options", (table) => {
    table.integer("traveler_id")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_desk_flight_options
    SET
      traveler_id = travel_authorizations.user_id
    FROM
      travel_authorizations
      INNER JOIN travel_desk_travel_requests ON travel_authorizations.id = travel_desk_travel_requests.travel_authorization_id
      INNER JOIN travel_desk_flight_requests ON travel_desk_travel_requests.id = travel_desk_flight_requests.travel_request_id
    WHERE
      travel_desk_flight_options.flight_request_id = travel_desk_flight_requests.id;
  `)

  await knex.schema.alterTable("travel_desk_flight_options", (table) => {
    table.integer("traveler_id").notNullable().alter()

    table.foreign("traveler_id").references("users.id").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_flight_options", (table) => {
    table.dropForeign(["traveler_id"])
    table.dropColumn("traveler_id")
  })
}
