import * as knex from "knex"

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("stops", function (table) {
    table.string("accommodationType", 255)
  })

  await knex.raw(`
    UPDATE "stops"
    SET "accommodationType" = "forms"."accommodationType"
    FROM "forms"
    WHERE "stops"."taid" = "forms"."id";
  `)

  await knex.schema.alterTable("forms", function (table) {
    table.dropColumn("accommodationType")
  })
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("forms", function (table) {
    table.string("accommodationType", 255)
  })

  await knex.raw(`
    WITH "deduplicatedAccommodationTypes" AS (
      SELECT DISTINCT ON ("taid", "accommodationType")
        "taid"
        , "accommodationType"
        , "departureDate"
        , "departureTime"
      FROM
        stops
      ORDER BY
        "taid"
        , "accommodationType"
        , "departureDate"
        , "departureTime"
    )
    , "accommodationTypesArray" AS (
      SELECT
        "taid"
        , array_to_string(
            array_agg("accommodationType" ORDER BY "departureDate", "departureTime")
            , ','
          ) AS "accommodationTypes"
      FROM
        "deduplicatedAccommodationTypes"
      GROUP BY
        "taid"
    )
    UPDATE
      "forms"
    SET
      "accommodationType" = "accommodationTypesArray"."accommodationTypes"
    FROM
      "accommodationTypesArray"
    WHERE
      "accommodationTypesArray"."taid" = "forms"."id";
  `)

  await knex.schema.alterTable("stops", function (table) {
    table.dropColumn("accommodationType")
  })
}
