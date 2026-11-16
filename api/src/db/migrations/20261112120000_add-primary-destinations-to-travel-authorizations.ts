import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("estimated_primary_destination_id").nullable()
    table.integer("actual_primary_destination_id").nullable()

    table
      .foreign("estimated_primary_destination_id")
      .references("id")
      .inTable("locations")
      .onDelete("RESTRICT")
    table
      .foreign("actual_primary_destination_id")
      .references("id")
      .inTable("locations")
      .onDelete("RESTRICT")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("estimated_primary_destination_id")
    table.dropColumn("actual_primary_destination_id")
  })
}
