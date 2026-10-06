import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.string("trip_type", 255)
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      trip_type = CASE
        WHEN one_way_trip = true THEN 'one_way'
        WHEN multi_stop = true THEN 'multi_city'
        ELSE 'round_trip'
      END
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("one_way_trip")
    table.dropColumn("multi_stop")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.boolean("one_way_trip")
    table.boolean("multi_stop")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      one_way_trip = CASE
        WHEN trip_type = 'one_way' THEN true
        ELSE false
      END,
      multi_stop = CASE
        WHEN trip_type = 'multi_city' THEN true
        ELSE false
      END
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("trip_type")
  })
}
