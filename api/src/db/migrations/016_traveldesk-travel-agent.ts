import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("travelDeskTravelAgent", function (t) {
    t.increments("agencyID").notNullable().primary()

    t.string("agencyName").notNullable()
    t.string("agencyInfo")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("travelDeskTravelAgent")
}
