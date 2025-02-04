import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // See https://ourairports.com/data/ -> airports.csv
  await knex.schema.createTable("airports", (table) => {
    table.increments("id").primary()
    table.string("ident", 4).notNullable().unique()
    table.string("name", 255).notNullable()
    table.string("continent", 3).nullable()
    table.string("iso_country", 2).notNullable()
    table.string("municipality").nullable()
    table.string("iata_code", 3).nullable()

    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("airports")
}
