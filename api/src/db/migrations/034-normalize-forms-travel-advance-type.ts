import * as knex from "knex"

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("forms", function (table) {
    table.integer("travelAdvanceInCents")
  })

  // Move data from the old column to the new one, and convert to cents.
  await knex.raw(`
    UPDATE "forms"
    SET "travelAdvanceInCents" = "travelAdvance" * 100
    WHERE "travelAdvance" IS NOT NULL;
  `)
}

export async function down(knex: knex.Knex) {
  // Move data back from the new column to the old one, and convert to dollars.
  await knex.raw(`
    UPDATE "forms"
    SET "travelAdvance" = ceil("travelAdvanceInCents" / 100.0)
    WHERE "travelAdvance" IS NOT NULL;
  `)

  await knex.schema.alterTable("forms", function (table) {
    table.dropColumn("travelAdvanceInCents")
  })
}
