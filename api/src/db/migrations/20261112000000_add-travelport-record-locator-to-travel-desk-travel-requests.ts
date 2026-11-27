import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.string("travel_port_record_locator", 6).nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.dropColumn("travel_port_record_locator")
  })
}
