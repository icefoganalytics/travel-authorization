import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_segments", (table) => {
    table.boolean("is_primary_destination").notNullable().defaultTo(false)
  })
  await knex.raw(`
    CREATE UNIQUE INDEX travel_segments_primary_destination_per_phase
    ON travel_segments (travel_authorization_id, is_actual)
    WHERE is_primary_destination = true
  `)
  await knex.raw(`
    ALTER TABLE travel_segments
    ADD CONSTRAINT travel_segments_primary_destination_requires_arrival
    CHECK (NOT is_primary_destination OR arrival_location_id IS NOT NULL)
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE travel_segments
    DROP CONSTRAINT travel_segments_primary_destination_requires_arrival
  `)
  await knex.raw("DROP INDEX travel_segments_primary_destination_per_phase")
  await knex.schema.alterTable("travel_segments", (table) => {
    table.dropColumn("is_primary_destination")
  })
}
