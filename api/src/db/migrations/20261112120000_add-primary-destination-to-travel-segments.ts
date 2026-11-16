import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_segments", (table) => {
    table.boolean("is_primary_destination").notNullable().defaultTo(false)

    const primaryDestinationPredicate = knex.whereRaw("?? = true", ["is_primary_destination"])
    table.unique(["travel_authorization_id", "is_actual"], {
      indexName: "travel_segments_primary_destination_per_phase",
      predicate: primaryDestinationPredicate,
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_segments", (table) => {
    table.dropIndex(
      ["travel_authorization_id", "is_actual"],
      "travel_segments_primary_destination_per_phase"
    )
    table.dropColumn("is_primary_destination")
  })
}
