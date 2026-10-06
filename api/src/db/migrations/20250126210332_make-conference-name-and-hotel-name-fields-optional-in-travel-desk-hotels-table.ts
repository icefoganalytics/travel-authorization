import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_hotels", (table) => {
    table.string("conference_name", 255).nullable().alter()
    table.string("conference_hotel_name", 255).nullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_desk_hotels
    SET
      conference_name = '',
      conference_hotel_name = ''
  `)

  await knex.schema.alterTable("travel_desk_hotels", (table) => {
    table.string("conference_name", 255).notNullable().alter()
    table.string("conference_hotel_name", 255).notNullable().alter()
  })
}
