import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw("UPDATE users SET email = LOWER(email);")
  await knex.raw("UPDATE travel_desk_travel_requests SET bus_email = LOWER(bus_email);")
  await knex.raw(`
    UPDATE
      travel_authorizations
    SET
      email = LOWER(email)
      , supervisor_email = LOWER(supervisor_email);
  `)
}

export async function down(_knex: Knex): Promise<void> {}
