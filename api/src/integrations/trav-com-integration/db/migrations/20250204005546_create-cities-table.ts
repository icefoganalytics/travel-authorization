import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("Cities", (table) => {
    table.tinyint("CityType").notNullable()
    table.string("CityCode", 5).nullable()
    table.string("CityName", 50).notNullable()
    table.string("Country", 50).nullable()
    table.string("CountryAbbr", 2).nullable()
    table.string("State", 50).nullable()
    table.string("Region1", 50).nullable()
    table.string("Region2", 50).nullable()
    table.tinyint("LatDeg").notNullable()
    table.tinyint("LatMin").notNullable()
    table.tinyint("LatSec").notNullable()
    table.string("LatDir", 1).nullable()
    table.tinyint("LonDeg").notNullable()
    table.tinyint("LonMin").notNullable()
    table.tinyint("LonSec").notNullable()
    table.string("LonDir", 1).nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("Cities")
}
