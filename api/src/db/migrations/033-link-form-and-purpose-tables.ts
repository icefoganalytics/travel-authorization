import * as knex from "knex"

export async function up(knex: knex.Knex) {
  // replace any ids saved as forms.purpose with the correct string.
  await knex.raw(`
    UPDATE "forms"
    SET "purpose" = "travelPurpose"."purpose"
    FROM "travelPurpose"
    WHERE "forms"."purpose" = "travelPurpose"."id"::TEXT;
  `)

  // add the appropriate foreign key to the travelPurpose table.
  await knex.schema.alterTable("forms", function (table) {
    table.integer("purposeId").unsigned().references("id").inTable("travelPurpose")
  })

  // Add in foreign keys where they match a valid purpose
  await knex.raw(`
    UPDATE "forms"
    SET "purposeId" = "travelPurpose"."id"
    FROM "travelPurpose"
    WHERE "forms"."purpose" = "travelPurpose"."purpose";
  `)
}

export async function down(knex: knex.Knex) {
  // update old purpose field with value from travelPurpose table
  await knex.raw(`
    UPDATE "forms"
    SET "purpose" = "travelPurpose"."purpose"
    FROM "travelPurpose"
    WHERE "forms"."purposeId" = "travelPurpose".id;
  `)

  await knex.schema.alterTable("forms", function (table) {
    table.dropColumn("purposeId")
  })
}
